'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTeacherClasses, getMaterialsForBatch, addMaterial, deleteMaterial } from '@/lib/firestore-helpers';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Upload, Link as LinkIcon, Trash2, FileText, Video, Music, ExternalLink,
  Plus, X, AlertCircle, RefreshCw
} from 'lucide-react';
import type { Class, Material, MaterialType, PhysicsTopic } from '@/lib/types';

const TOPICS: PhysicsTopic[] = ['Mechanics', 'Waves', 'Electromagnetism', 'Optics', 'Quantum', 'Thermodynamics', 'Modern Physics'];
const TYPE_ICONS: Record<MaterialType, React.ElementType> = { video: Video, audio: Music, pdf: FileText, link: LinkIcon };

function SkeletonRow() {
  return <div className="h-16 bg-white/5 rounded-xl animate-pulse" />;
}

export default function MaterialsPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '', topic: 'Mechanics' as PhysicsTopic, description: '',
    type: 'video' as MaterialType, batch_id: '', externalUrl: '',
  });

  useEffect(() => {
    if (!userProfile) return;
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const cls = await getTeacherClasses(userProfile.id);
      setClasses(cls);
      if (cls.length > 0) {
        setForm(f => ({ ...f, batch_id: cls[0].id }));
        try {
          const mats = await getMaterialsForBatch(cls[0].id);
          setMaterials(mats);
        } catch (err: any) {
          console.error('Failed to load materials:', err);
          toast({ title: 'Notice', description: 'Some materials could not be loaded. If this is a new project, you may need to create database indexes.', variant: 'destructive' });
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    const file = selectedFile;
    const batchId = form.batch_id || (classes.length > 0 ? classes[0].id : '');
    
    if (!file || !form.title || !batchId) {
      const missing = [];
      if (!file) missing.push('File');
      if (!form.title) missing.push('Title');
      if (!batchId) missing.push('Batch');
      toast({ title: 'Missing fields', description: `Please provide: ${missing.join(', ')}`, variant: 'destructive' });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const path = `materials/${form.batch_id}/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      const task = uploadBytesResumable(sRef, file);
      await new Promise<void>((resolve, reject) => {
        task.on('state_changed',
          snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          resolve
        );
      });
      const url = await getDownloadURL(sRef);
      await addMaterial({
        title: form.title, topic: form.topic, description: form.description,
        type: form.type, batch_id: batchId, file_url: url,
        uploaded_by: userProfile!.id,
      });
      toast({ title: '✅ Uploaded!', description: `${form.title} is now available to students.` });
      setShowForm(false);
      setUploadProgress(null);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
      await loadData();
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleLinkSubmit = async () => {
    const batchId = form.batch_id || (classes.length > 0 ? classes[0].id : '');
    
    if (!form.title || !form.externalUrl || !batchId) {
      toast({ title: 'Missing fields', description: 'Fill in title and URL', variant: 'destructive' });
      return;
    }
    try {
      await addMaterial({
        title: form.title, topic: form.topic, description: form.description,
        type: 'link', batch_id: batchId, file_url: form.externalUrl,
        uploaded_by: userProfile!.id,
      });
      toast({ title: '✅ Link added!', description: form.title });
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (mat: Material) => {
    if (!confirm(`Delete "${mat.title}"?`)) return;
    try {
      await deleteMaterial(mat.id);
      if (mat.type !== 'link') {
        try { await deleteObject(storageRef(storage, mat.file_url)); } catch {}
      }
      setMaterials(m => m.filter(x => x.id !== mat.id));
      toast({ title: 'Deleted', description: mat.title });
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Material Library</h1>
          <p className="text-muted-foreground mt-1">Upload videos, PDFs, audio, or add external links for your students.</p>
        </div>
        <Button onClick={() => setShowForm(s => !s)} className="bg-brand-cobalt hover:bg-brand-cobalt/90 h-11 px-5 rounded-xl">
          {showForm ? <><X className="mr-2 w-4 h-4" />Cancel</> : <><Plus className="mr-2 w-4 h-4" />Add Material</>}
        </Button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <Card className="glass-card border-brand-cobalt/30">
          <CardHeader>
            <CardTitle className="text-lg">New Material</CardTitle>
            {/* Toggle */}
            <div className="flex gap-2 mt-2">
              {(['file', 'link'] as const).map(m => (
                <button key={m} onClick={() => setUploadMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${uploadMode === m ? 'bg-brand-cobalt text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>
                  {m === 'file' ? <><Upload className="inline w-3 h-3 mr-1" />Upload File</> : <><LinkIcon className="inline w-3 h-3 mr-1" />External Link</>}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="e.g., Introduction to Mechanics" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-brand-cobalt h-11" />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value as PhysicsTopic }))}
                  className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-brand-cobalt focus:outline-none">
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Batch</Label>
                <select value={form.batch_id} onChange={e => setForm(f => ({ ...f, batch_id: e.target.value }))}
                  className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-brand-cobalt focus:outline-none">
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {uploadMode === 'file' && (
                <div className="space-y-2">
                  <Label>File Type</Label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as MaterialType }))}
                    className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-brand-cobalt focus:outline-none">
                    {(['video', 'audio', 'pdf'] as const).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description for students..."
                className="w-full h-20 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-brand-cobalt focus:outline-none resize-none" />
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-3">
                <Label>File</Label>
                <input ref={fileRef} type="file"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-cobalt/10 file:text-brand-cobalt hover:file:bg-brand-cobalt/20 cursor-pointer" />
                {uploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span><span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                <Button onClick={handleFileUpload} disabled={uploading} className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl">
                  {uploading ? 'Uploading...' : 'Upload & Save'}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>URL (YouTube, Google Drive, etc.)</Label>
                <Input placeholder="https://..." value={form.externalUrl}
                  onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-brand-cobalt h-11" />
                <Button onClick={handleLinkSubmit} className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl">
                  Save Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Materials List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : materials.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No materials yet. Upload your first file above.</p>
            </CardContent>
          </Card>
        ) : (
          materials.map(mat => {
            const Icon = TYPE_ICONS[mat.type] || FileText;
            return (
              <Card key={mat.id} className="glass-card hover:border-brand-cobalt/20 transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-brand-cobalt/10 p-3 rounded-xl flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand-cobalt" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{mat.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{mat.topic} · {mat.type.toUpperCase()} · {mat.completed_by?.length || 0} completed</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <a href={mat.file_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleDelete(mat)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
