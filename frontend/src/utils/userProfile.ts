/**
 * userProfile.ts
 *
 * 로그인 없이 브라우저(localStorage) 기반으로 부스 활동용 1회용 프로필 관리
 */

export interface UserProfile {
  uid: string;           // 기기 고유 난수 ID (작성자 식별 및 본인 글 삭제용)
  username: string;      // 부스 활동에 사용할 1회용 아이디(닉네임)
  displayName: string;   // 표시 이름
  avatar: string;        // 아바타 이미지 URL
  createdAt: number;
  isTeacher?: boolean;   // 선생님 인증 여부
}

const STORAGE_KEY = 'uryeo_english_fair_user_profile';
const ADMIN_SESSION_KEY = 'uryeo_english_fair_admin_session';

// ─── 선생님 사전 등록 계정 및 비밀번호 ─────────────────────────────────────────
export const TEACHER_ACCOUNTS = [
  'uryeo-lee',
  'uryeo-kim',
  'uryeo-sung',
] as const;

export const TEACHER_PASSWORD = 'uryeo2026';

export function isTeacherAccount(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  return (TEACHER_ACCOUNTS as readonly string[]).includes(normalized);
}

// 부스 활동용 아바타 프리셋 목록
export const AVATAR_PRESETS = [
  { id: 'av_1', label: '영문 도서', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=200&q=80' },
  { id: 'av_2', label: '헤드폰 리스너', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80' },
  { id: 'av_3', label: '열공 학생 A', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { id: 'av_4', label: '열공 학생 B', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
  { id: 'av_5', label: '원어민 멘토', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: 'av_6', label: '동아리 리더', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=200&q=80' },
  { id: 'av_7', label: '스터디 카페', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=200&q=80' },
  { id: 'av_8', label: '새내기 학생', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
];

export const DEFAULT_GUEST_AVATAR = AVATAR_PRESETS[0].url;

/**
 * 저장된 프로필 가져오기 (없으면 null 반환 -> 최초 접근 시 미설정 상태)
 */
export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

/**
 * 프로필 저장
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

/**
 * 프로필 삭제 (로그아웃 / 재설정용)
 */
export function clearUserProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear user profile:', e);
  }
}

// ─── 선생님 관리자 모드 ───────────────────────────────────────────────────────

export function isAdminAuthenticated(): boolean {
  try {
    const profile = getUserProfile();
    if (profile?.isTeacher) return true;
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to update admin session:', e);
  }
}
