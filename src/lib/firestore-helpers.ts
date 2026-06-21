import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Class, Material, Question, Quiz, QuizAttempt, LiveClass, RoutineSlot, Notification } from './types';

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } as UserProfile : null;
}

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'id' | 'created_at' | 'last_active'>) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    created_at: serverTimestamp(),
    last_active: serverTimestamp(),
  });
}

export async function updateUserLastActive(uid: string) {
  await updateDoc(doc(db, 'users', uid), { last_active: serverTimestamp() });
}

// ─── Classes ─────────────────────────────────────────────────────────────────
export function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createClass(teacherId: string, name: string): Promise<Class> {
  const code = generateClassCode();
  const ref = await addDoc(collection(db, 'classes'), {
    name,
    teacher_id: teacherId,
    student_ids: [],
    class_code: code,
    created_at: serverTimestamp(),
  });
  return { id: ref.id, name, teacher_id: teacherId, student_ids: [], class_code: code, created_at: Timestamp.now() };
}

export async function getClassByCode(code: string): Promise<Class | null> {
  const q = query(collection(db, 'classes'), where('class_code', '==', code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Class;
}

export async function joinClass(classId: string, studentId: string) {
  const classRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classRef);
  if (!classSnap.exists()) throw new Error('Class not found');
  const studentIds: string[] = classSnap.data().student_ids || [];
  if (!studentIds.includes(studentId)) {
    await updateDoc(classRef, { student_ids: [...studentIds, studentId] });
  }
  // Also add batch_id to user profile
  const userRef = doc(db, 'users', studentId);
  const userSnap = await getDoc(userRef);
  const batchIds: string[] = userSnap.data()?.batch_ids || [];
  if (!batchIds.includes(classId)) {
    await updateDoc(userRef, { batch_ids: [...batchIds, classId] });
  }
}

export async function getTeacherClasses(teacherId: string): Promise<Class[]> {
  const q = query(collection(db, 'classes'), where('teacher_id', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Class);
}

// ─── Materials ────────────────────────────────────────────────────────────────
export async function getMaterialsForBatch(batchId: string): Promise<Material[]> {
  const q = query(collection(db, 'materials'), where('batch_id', '==', batchId), orderBy('uploaded_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Material);
}

export async function addMaterial(data: Omit<Material, 'id' | 'uploaded_at' | 'completed_by'>) {
  return addDoc(collection(db, 'materials'), {
    ...data,
    completed_by: [],
    uploaded_at: serverTimestamp(),
  });
}

export async function deleteMaterial(id: string) {
  await deleteDoc(doc(db, 'materials', id));
}

export async function markMaterialComplete(materialId: string, studentId: string) {
  const ref = doc(db, 'materials', materialId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const completed: string[] = snap.data().completed_by || [];
  if (!completed.includes(studentId)) {
    await updateDoc(ref, { completed_by: [...completed, studentId] });
  }
}

// ─── Questions ────────────────────────────────────────────────────────────────
export async function getQuestions(teacherId: string): Promise<Question[]> {
  const q = query(collection(db, 'questions'), where('created_by', '==', teacherId), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Question);
}

export async function addQuestion(data: Omit<Question, 'id' | 'created_at'>) {
  return addDoc(collection(db, 'questions'), { ...data, created_at: serverTimestamp() });
}

export async function deleteQuestion(id: string) {
  await deleteDoc(doc(db, 'questions', id));
}

export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (!ids.length) return [];
  const snaps = await Promise.all(ids.map(id => getDoc(doc(db, 'questions', id))));
  return snaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() }) as Question);
}

// ─── Quizzes ─────────────────────────────────────────────────────────────────
export async function getQuizzesForBatch(batchId: string): Promise<Quiz[]> {
  const q = query(collection(db, 'quizzes'), where('batch_id', '==', batchId), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Quiz);
}

export async function addQuiz(data: Omit<Quiz, 'id' | 'created_at'>) {
  return addDoc(collection(db, 'quizzes'), { ...data, created_at: serverTimestamp() });
}

export async function updateQuiz(id: string, data: Partial<Quiz>) {
  await updateDoc(doc(db, 'quizzes', id), data);
}

export async function deleteQuiz(id: string) {
  await deleteDoc(doc(db, 'quizzes', id));
}

// ─── Quiz Attempts ────────────────────────────────────────────────────────────
export async function submitQuizAttempt(data: Omit<QuizAttempt, 'id' | 'submitted_at'>) {
  return addDoc(collection(db, 'quiz_attempts'), { ...data, submitted_at: serverTimestamp() });
}

export async function getStudentAttempts(studentId: string): Promise<QuizAttempt[]> {
  const q = query(collection(db, 'quiz_attempts'), where('student_id', '==', studentId), orderBy('submitted_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as QuizAttempt);
}

export async function getAttemptsByQuiz(quizId: string): Promise<QuizAttempt[]> {
  const q = query(collection(db, 'quiz_attempts'), where('quiz_id', '==', quizId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as QuizAttempt);
}

export async function getStudentAttemptForQuiz(quizId: string, studentId: string): Promise<QuizAttempt | null> {
  const q = query(collection(db, 'quiz_attempts'), where('quiz_id', '==', quizId), where('student_id', '==', studentId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as QuizAttempt;
}

// ─── Live Classes ─────────────────────────────────────────────────────────────
export async function getLiveClassesForBatch(batchId: string): Promise<LiveClass[]> {
  const q = query(collection(db, 'live_classes'), where('batch_id', '==', batchId), orderBy('scheduled_time', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as LiveClass);
}

export async function addLiveClass(data: Omit<LiveClass, 'id'>) {
  const ref = await addDoc(collection(db, 'live_classes'), data);
  // Create notification
  await addDoc(collection(db, 'notifications'), {
    batch_id: data.batch_id,
    type: 'class_scheduled',
    title: 'New Class Scheduled',
    message: `${data.title} — ${new Date(data.scheduled_time.toMillis()).toLocaleString()}`,
    created_at: serverTimestamp(),
    read_by: [],
  });
  return ref;
}

export async function updateLiveClass(id: string, data: Partial<LiveClass>) {
  await updateDoc(doc(db, 'live_classes', id), data);
}

export async function deleteLiveClass(id: string) {
  await deleteDoc(doc(db, 'live_classes', id));
}

// ─── Routine ─────────────────────────────────────────────────────────────────
export async function getRoutineForBatch(batchId: string): Promise<RoutineSlot[]> {
  const q = query(collection(db, 'routine'), where('batch_id', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as RoutineSlot);
}

export async function setRoutineSlot(batchId: string, slot: Omit<RoutineSlot, 'id' | 'batch_id'>, existingId?: string) {
  if (existingId) {
    await updateDoc(doc(db, 'routine', existingId), { ...slot, batch_id: batchId });
  } else {
    await addDoc(collection(db, 'routine'), { ...slot, batch_id: batchId });
  }
}

export async function deleteRoutineSlot(id: string) {
  await deleteDoc(doc(db, 'routine', id));
}

// ─── Notifications ────────────────────────────────────────────────────────────
export function subscribeToNotifications(batchIds: string[], callback: (notifications: Notification[]) => void) {
  if (!batchIds.length) return () => {};
  const q = query(
    collection(db, 'notifications'),
    where('batch_id', 'in', batchIds.slice(0, 10)), // Firestore 'in' limit
    orderBy('created_at', 'desc')
  );
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Notification));
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const ref = doc(db, 'notifications', notificationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const readBy: string[] = snap.data().read_by || [];
  if (!readBy.includes(userId)) {
    await updateDoc(ref, { read_by: [...readBy, userId] });
  }
}

// ─── Admin Helpers ────────────────────────────────────────────────────────────
export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as UserProfile);
}

export async function getAllClasses(): Promise<Class[]> {
  const snap = await getDocs(collection(db, 'classes'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Class);
}

export async function getAllMaterials(): Promise<Material[]> {
  const q = query(collection(db, 'materials'), orderBy('uploaded_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Material);
}

export async function getAllQuestions(): Promise<Question[]> {
  const q = query(collection(db, 'questions'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Question);
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const q = query(collection(db, 'quizzes'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Quiz);
}

export async function getAllQuizAttempts(): Promise<QuizAttempt[]> {
  const q = query(collection(db, 'quiz_attempts'), orderBy('submitted_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as QuizAttempt);
}

export async function adminUpdateUser(uid: string, data: Partial<Omit<UserProfile, 'id'>>) {
  await updateDoc(doc(db, 'users', uid), data as Record<string, unknown>);
}

export async function adminDeleteUserProfile(uid: string) {
  await deleteDoc(doc(db, 'users', uid));
}

export async function adminDeleteClass(classId: string) {
  await deleteDoc(doc(db, 'classes', classId));
}

export async function adminUpdateMaterial(id: string, data: Partial<Material>) {
  await updateDoc(doc(db, 'materials', id), data as Record<string, unknown>);
}

export async function adminUpdateQuestion(id: string, data: Partial<Question>) {
  await updateDoc(doc(db, 'questions', id), data as Record<string, unknown>);
}

export async function adminDeleteQuestion(id: string) {
  await deleteDoc(doc(db, 'questions', id));
}

export async function adminDeleteQuiz(id: string) {
  await deleteDoc(doc(db, 'quizzes', id));
}

