import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Settings,
  Users,
  Camera,
  CheckCircle2,
  RefreshCw,
  Trash2,
  ShieldAlert,
  Award,
  Search,
  Check,
  MessageSquare,
  FileText,
  MessageCircle,
  Download,
} from 'lucide-react';
import type {
  MissionSettings,
  PhotoTicket,
  FsUserPost,
  FsComment,
  ChatQueryLog,
  UserSession,
} from '../services/firestoreService';
import {
  subscribeMissionSettings,
  updateMissionSettings,
  subscribeAllTickets,
  issuePhotoTicket,
  resetPhotoTicket,
  deletePhotoTicket,
  subscribeChatQueries,
  subscribeAllUserSessions,
  DEFAULT_MISSION_SETTINGS,
} from '../services/firestoreService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allPosts: FsUserPost[];
  allComments: FsComment[];
  onOpenPhotoboothKiosk?: () => void;
}

export const AdminMissionManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  allPosts,
  allComments,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'participants' | 'sessions' | 'chatlogs' | 'posts' | 'comments'>('participants');
  const [settings, setSettings] = useState<MissionSettings>(DEFAULT_MISSION_SETTINGS);
  const [tickets, setTickets] = useState<PhotoTicket[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatQueryLog[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [sessionSearch, setSessionSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [commentSearch, setCommentSearch] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 폼 입력 상태
  const [formReqPosts, setFormReqPosts] = useState(1);
  const [formReqComments, setFormReqComments] = useState(2);
  const [formIsEnabled, setFormIsEnabled] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [formBannerNotice, setFormBannerNotice] = useState('');

  // 설정 구독
  useEffect(() => {
    const unsub = subscribeMissionSettings((s) => {
      setSettings(s);
      setFormReqPosts(s.requiredPosts);
      setFormReqComments(s.requiredComments);
      setFormIsEnabled(s.isEnabled);
      setFormTitle(s.title);
      setFormBannerNotice(s.bannerNotice);
    });
    return () => unsub();
  }, []);

  // 티켓 구독
  useEffect(() => {
    const unsub = subscribeAllTickets((tList) => {
      setTickets(tList);
    });
    return () => unsub();
  }, []);

  // 챗봇 질문 로그 구독
  useEffect(() => {
    const unsub = subscribeChatQueries((logs) => {
      setChatLogs(logs);
    });
    return () => unsub();
  }, []);

  // 사용자 세션 구독
  useEffect(() => {
    const unsub = subscribeAllUserSessions((sessions) => {
      setUserSessions(sessions);
    });
    return () => unsub();
  }, []);

  // 설정 저장
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      await updateMissionSettings({
        requiredPosts: Number(formReqPosts),
        requiredComments: Number(formReqComments),
        isEnabled: formIsEnabled,
        title: formTitle.trim() || DEFAULT_MISSION_SETTINGS.title,
        bannerNotice: formBannerNotice.trim() || DEFAULT_MISSION_SETTINGS.bannerNotice,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('설정 저장 실패:', err);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // 모든 참여자 목록 분석 및 집계 (익명 아이디 기준)
  const participantList = useMemo(() => {
    const map = new Map<
      string,
      {
        authorId: string;
        username: string;
        postCount: number;
        commentCount: number;
      }
    >();

    // 피드 작성자들
    allPosts.forEach((p) => {
      const uKey = p.authorId || p.authorName;
      if (!uKey) return;
      const cleanName = p.authorName.replace(/^@/, '');
      if (!map.has(uKey)) {
        map.set(uKey, {
          authorId: p.authorId || uKey,
          username: cleanName,
          postCount: 0,
          commentCount: 0,
        });
      }
      map.get(uKey)!.postCount += 1;
    });

    // 댓글 작성자들
    allComments.forEach((c) => {
      const uKey = c.authorId || c.author;
      if (!uKey) return;
      const cleanName = c.author.replace(/^@/, '');
      if (!map.has(uKey)) {
        map.set(uKey, {
          authorId: c.authorId || uKey,
          username: cleanName,
          postCount: 0,
          commentCount: 0,
        });
      }
      map.get(uKey)!.commentCount += 1;
    });

    // 티켓 보유자 중 아직 위 맵에 없는 경우도 추가
    tickets.forEach((t) => {
      const uKey = t.authorId || t.authorName;
      if (!uKey) return;
      const cleanName = t.authorName.replace(/^@/, '');
      if (!map.has(uKey)) {
        map.set(uKey, {
          authorId: t.authorId || uKey,
          username: cleanName,
          postCount: 0,
          commentCount: 0,
        });
      }
    });

    // 티켓 정보 매핑
    return Array.from(map.values()).map((p) => {
      const ticket = tickets.find(
        (t) => t.authorId === p.authorId || t.authorName === p.username
      );
      const isQualified =
        p.postCount >= settings.requiredPosts &&
        p.commentCount >= settings.requiredComments;

      return {
        ...p,
        ticket,
        isQualified,
      };
    });
  }, [allPosts, allComments, tickets, settings]);

  // 검색 필터링
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participantList;
    const q = searchQuery.toLowerCase();
    return participantList.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.authorId.toLowerCase().includes(q) ||
        p.ticket?.ticketId.toLowerCase().includes(q)
    );
  }, [participantList, searchQuery]);

  // 수동 발급
  const handleManualIssue = async (authorId: string, username: string) => {
    if (!window.confirm(`@${username} 학생에게 수동으로 포토부스 촬영권을 발급하시겠습니까?`)) {
      return;
    }
    try {
      await issuePhotoTicket(authorId, username, true);
    } catch (err) {
      console.error('수동 발급 실패:', err);
      alert('발급 중 오류가 발생했습니다.');
    }
  };

  // 재촬영 허용 (티켓 리셋)
  const handleResetTicket = async (ticketDocId: string, username: string) => {
    if (
      !window.confirm(
        `@${username} 학생의 티켓을 '미사용' 상태로 재설정하여 재촬영을 허용하시겠습니까?`
      )
    ) {
      return;
    }
    try {
      await resetPhotoTicket(ticketDocId);
    } catch (err) {
      console.error('티켓 리셋 실패:', err);
      alert('리셋 중 오류가 발생했습니다.');
    }
  };

  // 티켓 삭제
  const handleDeleteTicket = async (ticketDocId: string, username: string) => {
    if (!window.confirm(`@${username} 학생의 촬영권 티켓을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await deletePhotoTicket(ticketDocId);
    } catch (err) {
      console.error('티켓 삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  const totalUsedTickets = tickets.filter((t) => t.status === 'used').length;
  const totalIssuedTickets = tickets.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">포토부스 미션 관리 & 현황 모니터링</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  교사 관리자
                </span>
              </div>
              <p className="text-xs text-slate-400">
                타교생 익명 참여 현황 모니터링 및 미션 조건 실시간 설정
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'participants'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>참여자 모니터링 ({participantList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('chatlogs')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'chatlogs'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>챗봇 질문 ({chatLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'sessions'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-500" />
            <span>참여자 세션 ({userSessions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'posts'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-pink-500" />
            <span>피드 소감 ({allPosts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'comments'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-purple-500" />
            <span>댓글 모음 ({allComments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>부스 설정</span>
          </button>
        </div>

        {/* 요약 현황 통계 카드 바 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-100/60 border-b border-slate-200 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[11px]">총 참여 계정</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {participantList.length}개
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[11px]">누적 피드 / 댓글</div>
            <div className="text-base font-extrabold text-indigo-600 mt-0.5">
              {allPosts.length}개 / {allComments.length}개
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[11px]">티켓 발급 완료</div>
            <div className="text-base font-extrabold text-amber-600 mt-0.5">
              {totalIssuedTickets}장
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[11px]">촬영 완료</div>
            <div className="text-base font-extrabold text-emerald-600 mt-0.5">
              {totalUsedTickets}회
            </div>
          </div>
        </div>

        {/* 본문 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* 탭 1: 참여자 모니터링 */}
          {activeTab === 'participants' && (
            <div className="space-y-3">
              {/* 검색창 */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="익명 아이디 또는 티켓 번호 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              {/* 참여자 테이블 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">익명 ID</th>
                      <th className="py-2.5 px-2 text-center">피드</th>
                      <th className="py-2.5 px-2 text-center">댓글</th>
                      <th className="py-2.5 px-3 text-center">미션 상태</th>
                      <th className="py-2.5 px-3 text-center">촬영권 상태</th>
                      <th className="py-2.5 px-3 text-right">관리 액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                          참여 기록이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => {
                        const ticket = p.ticket;
                        return (
                          <tr key={p.authorId} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              @{p.username}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-md font-mono ${
                                  p.postCount >= settings.requiredPosts
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {p.postCount}/{settings.requiredPosts}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-md font-mono ${
                                  p.commentCount >= settings.requiredComments
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {p.commentCount}/{settings.requiredComments}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {p.isQualified ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  달성 완료
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                                  진행 중
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {ticket ? (
                                ticket.status === 'used' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                    <Check className="w-3 h-3" />
                                    촬영완료 ({ticket.usedAt?.toLocaleTimeString() || ''})
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                    <Award className="w-3 h-3 text-amber-600" />
                                    발급됨 (미사용)
                                  </span>
                                )
                              ) : (
                                <span className="text-[11px] text-slate-400">미발급</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!ticket ? (
                                  <button
                                    onClick={() => handleManualIssue(p.authorId, p.username)}
                                    className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] cursor-pointer"
                                    title="조건 미달이어도 수동 발급"
                                  >
                                    수동 발급
                                  </button>
                                ) : ticket.status === 'used' ? (
                                  <button
                                    onClick={() => handleResetTicket(ticket.id, p.username)}
                                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] cursor-pointer flex items-center gap-1"
                                    title="재촬영을 위해 티켓을 '미사용'으로 변경"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    재촬영 허용
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteTicket(ticket.id, p.username)}
                                    className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                                    title="티켓 취소/삭제"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 탭 2: 미션 조건 및 부스 설정 */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg mx-auto">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  설정을 변경하면 모든 학생 스마트폰과 부스 태블릿에 <strong>실시간으로 즉시 반영</strong>됩니다.
                </span>
              </div>

              {/* 기능 활성화 토글 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-slate-900">포토부스 미션 이벤트 활성화</div>
                  <div className="text-[11px] text-slate-500">
                    끄면 학생 화면에서 상단 배너와 QR 티켓 발급이 숨겨집니다.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsEnabled}
                    onChange={(e) => setFormIsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* 피드 필요 개수 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  필요한 피드 등록 개수
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={formReqPosts}
                    onChange={(e) => setFormReqPosts(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  />
                  <span className="text-xs text-slate-500">
                    개 이상 피드를 작성해야 미션 1 완료 (기본: 1)
                  </span>
                </div>
              </div>

              {/* 댓글 필요 개수 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  필요한 댓글 작성 개수
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={formReqComments}
                    onChange={(e) => setFormReqComments(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  />
                  <span className="text-xs text-slate-500">
                    개 이상 댓글을 작성해야 미션 2 완료 (기본: 2)
                  </span>
                </div>
              </div>

              {/* 부스 명칭 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  포토부스 이벤트 타이틀
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="예: 의령여고 영어과 인생네컷 포토부스"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {/* 공지 배너 문구 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  학생 화면 공지 배너 문구
                </label>
                <input
                  type="text"
                  value={formBannerNotice}
                  onChange={(e) => setFormBannerNotice(e.target.value)}
                  placeholder="예: 피드 1개 + 댓글 2개 작성 시 포토부스 무료 촬영권 증정! 📸"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {/* 저장 버튼 */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>설정이 안전하게 저장되었습니다!</span>
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span>{isSavingSettings ? '저장 중...' : '미션 설정 저장하기'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═════════════════════════════════════════════════════════════════════════
              탭 3: 챗봇 질문 & 관심사 실시간 분석 로그
              ═════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'chatlogs' && (
            <div className="space-y-3">
              {/* 상단 검색 및 엑셀/CSV 백업 다운로드 바 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="질문 문구, 키워드, 사용자 검색..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={() => {
                    if (chatLogs.length === 0) {
                      alert('저장할 질문 데이터가 없습니다.');
                      return;
                    }
                    const headers = ['일시', '작성자아이디', '이름', '구분', '질문내용', '답변요약'];
                    const rows = chatLogs.map((l) => [
                      `"${l.timestamp.toLocaleString('ko-KR')}"`,
                      `"${l.username || ''}"`,
                      `"${l.displayName || ''}"`,
                      `"${l.targetGroup === 'student' ? '중3/고등학생' : '학부모'}"`,
                      `"${l.query.replace(/"/g, '""')}"`,
                      `"${(l.answerSnippet || '').replace(/"/g, '""')}"`,
                    ]);
                    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `의령여고_영어과_챗봇질문분석_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  title="수집된 질문 로그를 CSV 엑셀 파일로 백업"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV 백업 다운로드</span>
                </button>
              </div>

              {/* 안내 문구 */}
              <div className="text-[11px] text-slate-500 px-1 flex items-center justify-between">
                <span>💡 참가자가 질문한 내용과 언급 키워드가 실시간으로 자동 수집됩니다.</span>
                <span className="font-semibold text-indigo-600">총 {chatLogs.length}건 수집됨</span>
              </div>

              {/* 질문 리스트 테이블 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {chatLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    아직 수집된 챗봇 질문이 없습니다. 참가자가 질문을 입력하면 이곳에 실시간 누적됩니다.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {chatLogs
                      .filter(
                        (l) =>
                          !chatSearch ||
                          l.query.toLowerCase().includes(chatSearch.toLowerCase()) ||
                          (l.username && l.username.toLowerCase().includes(chatSearch.toLowerCase())) ||
                          (l.displayName && l.displayName.toLowerCase().includes(chatSearch.toLowerCase()))
                      )
                      .map((log) => (
                        <div key={log.id} className="p-3.5 hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  log.targetGroup === 'student'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                              >
                                {log.targetGroup === 'student' ? '학생' : '학부모'}
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {log.displayName || log.username || '익명'}
                              </span>
                              {log.username && (
                                <span className="text-[11px] font-mono text-slate-400">
                                  @{log.username}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {log.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* 질문 내용 */}
                          <p className="text-xs font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                            💬 {log.query}
                          </p>

                          {/* 답변 요약 */}
                          {log.answerSnippet && (
                            <p className="text-[11px] text-slate-500 mt-1.5 px-1 line-clamp-2">
                              🤖 {log.answerSnippet}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ═════════════════════════════════════════════════════════════════════════
              탭 세션: 참여자 아이디별 사용 기록 & 4컷 부스 연동 키워드
              ═════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'sessions' && (
            <div className="space-y-3">
              {/* 상단 검색 & CSV 다운로드 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    placeholder="아이디, 키워드 검색..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={() => {
                    if (userSessions.length === 0) { alert('세션 데이터가 없습니다.'); return; }
                    const rows = [
                      ['아이디', '표시이름', '최초방문', '마지막활동', '피드수', '댓글수', '챗봇질문수', '4컷키워드', '챗봇질문목록'].join(','),
                      ...userSessions.map((s) => [
                        s.username,
                        s.displayName || '',
                        s.firstSeenAt?.toLocaleString('ko-KR') || '',
                        s.lastActiveAt?.toLocaleString('ko-KR') || '',
                        s.feedCount,
                        s.commentCount,
                        s.chatQueries.length,
                        `"${s.chatKeywords.join(' | ')}"`,
                        `"${s.chatQueries.slice(-10).join(' | ')}"`,
                      ].join(','))
                    ];
                    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `user_sessions_${new Date().toISOString().slice(0,10)}.csv`;
                    a.click(); URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV 다운로드
                </button>
              </div>

              {/* 세션 목록 */}
              {userSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">아직 세션 기록이 없습니다.</p>
                  <p className="text-xs mt-1">참여자가 로그인하면 자동으로 기록됩니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userSessions
                    .filter((s) => {
                      if (!sessionSearch) return true;
                      const q = sessionSearch.toLowerCase();
                      return (
                        s.username.includes(q) ||
                        (s.displayName || '').toLowerCase().includes(q) ||
                        s.chatKeywords.some((k) => k.includes(q)) ||
                        s.chatQueries.some((q2) => q2.includes(sessionSearch))
                      );
                    })
                    .map((s) => (
                      <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow">
                        {/* 헤더: 아이디 & 활동 시간 */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {s.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-extrabold text-slate-900">@{s.username}</span>
                              {s.displayName && s.displayName !== s.username && (
                                <span className="text-[10px] text-slate-500 ml-1">({s.displayName})</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            마지막 활동: {s.lastActiveAt?.toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) || '-'}
                          </span>
                        </div>

                        {/* 활동 수치 뱃지 */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            📸 피드 {s.feedCount}개
                          </span>
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            💬 댓글 {s.commentCount}회
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            🤖 챗봇 {s.chatQueries.length}문
                          </span>
                        </div>

                        {/* 4컷 부스 연동 키워드 */}
                        {s.chatKeywords.length > 0 && (
                          <div className="mb-2">
                            <p className="text-[10px] text-emerald-700 font-bold mb-1">📸 4컷 부스 연동 키워드</p>
                            <div className="flex flex-wrap gap-1">
                              {s.chatKeywords.map((kw) => (
                                <span key={kw} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 챗봇 질문 최근 3개 미리보기 */}
                        {s.chatQueries.length > 0 && (
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">최근 질문</p>
                            <ul className="space-y-0.5">
                              {s.chatQueries.slice(-3).reverse().map((q, i) => (
                                <li key={i} className="text-[11px] text-slate-700 bg-slate-50 px-2 py-1 rounded-lg truncate">
                                  · {q}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════════
              탭 4: 피드 소감 & 업로드 사진 전체 수집 및 분석
              ═════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'posts' && (
            <div className="space-y-3">
              {/* 상단 검색 및 엑셀/CSV 백업 다운로드 바 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    placeholder="소감 내용, 태그(#), 작성자 검색..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-pink-500"
                  />
                </div>

                <button
                  onClick={() => {
                    if (allPosts.length === 0) {
                      alert('저장할 피드 데이터가 없습니다.');
                      return;
                    }
                    const headers = ['일시', '작성자아이디', '이름', '태그', '소감글', '좋아요수', '사진URL'];
                    const rows = allPosts.map((p) => [
                      `"${p.timestamp ? p.timestamp.toLocaleString('ko-KR') : ''}"`,
                      `"${p.authorName || ''}"`,
                      `"${p.displayName || ''}"`,
                      `"${p.tag || ''}"`,
                      `"${(p.caption || '').replace(/"/g, '""')}"`,
                      `"${p.likesCount || 0}"`,
                      `"${p.photoUrl || ''}"`,
                    ]);
                    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `의령여고_영어과_피드소감모음_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  title="수집된 피드 소감 전체를 CSV 엑셀 파일로 백업"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>피드 CSV 다운로드</span>
                </button>
              </div>

              {/* 안내 문구 */}
              <div className="text-[11px] text-slate-500 px-1 flex items-center justify-between">
                <span>📸 학생들이 부스 체험 후 직접 올린 소감과 사진 기록입니다.</span>
                <span className="font-semibold text-pink-600">총 {allPosts.length}개 피드</span>
              </div>

              {/* 피드 리스트 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {allPosts.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    아직 등록된 피드가 없습니다.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {allPosts
                      .filter(
                        (p) =>
                          !postSearch ||
                          (p.caption && p.caption.toLowerCase().includes(postSearch.toLowerCase())) ||
                          (p.tag && p.tag.toLowerCase().includes(postSearch.toLowerCase())) ||
                          (p.authorName && p.authorName.toLowerCase().includes(postSearch.toLowerCase())) ||
                          (p.displayName && p.displayName.toLowerCase().includes(postSearch.toLowerCase()))
                      )
                      .map((post) => (
                        <div key={post.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex gap-3">
                          {/* 사진 썸네일 */}
                          {post.photoUrl && (
                            <img
                              src={post.photoUrl}
                              alt=""
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {post.displayName || post.authorName}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  @{post.authorName}
                                </span>
                                {post.tag && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
                                    {post.tag}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                                {post.timestamp?.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                              {post.caption}
                            </p>

                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                              <span>❤️ 좋아요 {post.likesCount || 0}</span>
                              <span className="text-slate-300">·</span>
                              <span>{post.timestamp?.toLocaleDateString('ko-KR')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════════
              탭 5: 댓글 모음 전체 수집 및 분석
              ═════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'comments' && (
            <div className="space-y-3">
              {/* 상단 검색 및 엑셀/CSV 백업 다운로드 바 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={commentSearch}
                    onChange={(e) => setCommentSearch(e.target.value)}
                    placeholder="댓글 내용, 작성자 검색..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={() => {
                    if (allComments.length === 0) {
                      alert('저장할 댓글 데이터가 없습니다.');
                      return;
                    }
                    const headers = ['일시', '작성자', '피드ID', '댓글내용'];
                    const rows = allComments.map((c) => [
                      `"${c.timestamp.toLocaleString('ko-KR')}"`,
                      `"${c.author || ''}"`,
                      `"${c.postId || ''}"`,
                      `"${(c.text || '').replace(/"/g, '""')}"`,
                    ]);
                    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `의령여고_영어과_댓글모음_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  title="수집된 댓글 전체를 CSV 엑셀 파일로 백업"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>댓글 CSV 다운로드</span>
                </button>
              </div>

              {/* 안내 문구 */}
              <div className="text-[11px] text-slate-500 px-1 flex items-center justify-between">
                <span>💬 참가자들이 서로 남긴 응원과 소통 댓글 기록입니다.</span>
                <span className="font-semibold text-purple-600">총 {allComments.length}개 댓글</span>
              </div>

              {/* 댓글 리스트 테이블 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {allComments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    아직 등록된 댓글이 없습니다.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {allComments
                      .filter(
                        (c) =>
                          !commentSearch ||
                          (c.text && c.text.toLowerCase().includes(commentSearch.toLowerCase())) ||
                          (c.author && c.author.toLowerCase().includes(commentSearch.toLowerCase()))
                      )
                      .map((comment) => (
                        <div key={comment.id} className="p-3.5 hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {comment.author || '익명'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                피드 #{comment.postId.slice(0, 8)}...
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {comment.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/70">
                            💬 {comment.text}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

