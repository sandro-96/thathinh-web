import { useEffect, useState, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import { Heart, UserX, AlertTriangle, ShieldAlert, History } from "lucide-react";

import { toast } from "sonner";

import { startFlirt, cancelFlirt, getFlirtStatus, getFlirtHistory } from "@/api/flirtApi";

import { getAccountStatus } from "@/api/userApi";

import { useWebSocket } from "@/hooks/useWebSocket";

import { useAuth } from "@/hooks/useAuth";

import { getApiErrorMessage } from "@/lib/apiErrors";

import { WS_TYPES, FLIRT_MATCH_TIMEOUT_SECONDS } from "@/constants/websocket";

import { EmptyState } from "@/components/EmptyState";

import { MatchCountdown } from "@/components/flirt/MatchCountdown";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const FLOAT_HEARTS = [
  { left: "8%", size: 20, dur: 7, delay: 0, rot: "-12deg", op: 0.5 },
  { left: "22%", size: 14, dur: 9, delay: 1.4, rot: "8deg", op: 0.35 },
  { left: "40%", size: 26, dur: 8, delay: 0.6, rot: "-6deg", op: 0.45 },
  { left: "58%", size: 16, dur: 10, delay: 2.2, rot: "14deg", op: 0.4 },
  { left: "74%", size: 22, dur: 7.5, delay: 0.9, rot: "-10deg", op: 0.5 },
  { left: "88%", size: 13, dur: 9.5, delay: 1.8, rot: "6deg", op: 0.3 },
];

function FloatingHearts() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
      {FLOAT_HEARTS.map((h, i) => (
        <Heart
          key={i}
          className="absolute text-rose-400 fill-rose-400/40"
          style={{
            left: h.left,
            bottom: "-28px",
            width: h.size,
            height: h.size,
            "--th-rot": h.rot,
            "--th-op": h.op,
            animation: `th-heart-rise ${h.dur}s ease-in ${h.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function FlirtPage() {

  const [status, setStatus] = useState("IDLE");

  const [countdown, setCountdown] = useState(FLIRT_MATCH_TIMEOUT_SECONDS);

  const [accountStatus, setAccountStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const { subscribe } = useWebSocket();

  const { user } = useAuth();

  const navigate = useNavigate();



  const loadAccountStatus = () => {

    getAccountStatus()

      .then((res) => setAccountStatus(res.data.data))

      .catch(() => {});

  };



  const applyWaitingState = useCallback((data) => {
    setStatus("WAITING");
    const remaining = data?.waitingSecondsRemaining ?? FLIRT_MATCH_TIMEOUT_SECONDS;
    setCountdown(Math.max(0, remaining));
  }, []);

  const applyFlirtStatus = useCallback((data) => {
    if (data.status === "MATCHED" || data.status === "CHATTING") {
      if (data.sessionId) {
        toast.success("Đã tìm được đối tác!");
        navigate(`/flirt/chat/${data.sessionId}`);
      }
      return;
    }
    if (data.status === "WAITING") {
      applyWaitingState(data);
      return;
    }
    setStatus("NO_MATCH");
  }, [navigate, applyWaitingState]);



  useEffect(() => {

    loadAccountStatus();
    getFlirtHistory(10)
      .then((res) => setHistory(res.data.data || []))
      .catch(() => {});

    getFlirtStatus().then((res) => {

      const data = res.data.data;

      if (data.status === "MATCHED" || data.status === "CHATTING") {

        navigate(`/flirt/chat/${data.sessionId}`);

      } else if (data.status === "WAITING") {
        applyWaitingState(data);
      }
    }).catch(() => {});
  }, [navigate, applyWaitingState]);



  useEffect(() => {

    if (!user?.id) return;

    const unsub = subscribe(`/topic/users/${user.id}/flirt`, (msg) => {

      if (msg.type === WS_TYPES.FLIRT_ENDED) {

        if (msg.data?.reason === "REPORTED" && msg.data?.role === "REPORTED") {

          toast.warning("Phiên chat đã kết thúc do có báo cáo về bạn. Admin đang xem xét — bạn vẫn có thể thả thính.");

          loadAccountStatus();

        } else if (msg.data?.reason === "REPORTED") {

          toast.success("Đã gửi báo cáo. Phiên chat đã kết thúc.");

        } else {

          toast.info("Đối tác đã kết thúc trò chuyện");

        }

        setStatus("IDLE");

      }

      if (msg.type === WS_TYPES.FLIRT_CANCELLED) {

        setStatus("NO_MATCH");

        setCountdown(FLIRT_MATCH_TIMEOUT_SECONDS);

      }

    });

    return unsub;

  }, [user?.id, subscribe, navigate]);



  // Poll status while waiting (fallback khi WS không kịp nhận FLIRT_MATCHED)

  useEffect(() => {

    if (status !== "WAITING") return undefined;

    const poll = setInterval(() => {

      getFlirtStatus()

        .then((res) => applyFlirtStatus(res.data.data))

        .catch(() => {});

    }, 3000);

    return () => clearInterval(poll);

  }, [status, applyFlirtStatus]);



  useEffect(() => {
    if (status !== "WAITING") return undefined;

    const interval = setInterval(() => {

      setCountdown((prev) => {

        if (prev <= 1) {

          clearInterval(interval);

          getFlirtStatus().then((res) => {

            const data = res.data.data;

            if (data.status === "MATCHED" || data.status === "CHATTING") {

              applyFlirtStatus(data);

            } else if (data.status === "WAITING") {

              cancelFlirt().finally(() => setStatus("NO_MATCH"));

            } else {

              setStatus("NO_MATCH");

            }

          }).catch(() => setStatus("NO_MATCH"));

          return 0;

        }

        return prev - 1;

      });

    }, 1000);



    return () => clearInterval(interval);

  }, [status, applyFlirtStatus]);



  const handleStart = async () => {

    if (accountStatus && !accountStatus.flirtAllowed) {

      toast.error(accountStatus.flirtBlockReason || "Bạn không thể thả thính lúc này");

      return;

    }

    try {

      const res = await startFlirt();

      const data = res.data.data;

      if (data.sessionId) {
        navigate(`/flirt/chat/${data.sessionId}`);
      } else {
        applyWaitingState(data);
      }

    } catch (err) {

      const code = err.response?.data?.code;

      if (code === "4107") {

        toast.error(getApiErrorMessage(err));

        navigate("/profile?onboarding=1");

        return;

      }

      if (code === "4106") {

        loadAccountStatus();

      }

      if (code === "4300") {
        getFlirtStatus()
          .then((res) => applyWaitingState(res.data.data))
          .catch(() => applyWaitingState({}));
        return;
      }

      toast.error(getApiErrorMessage(err, "Không thể bắt đầu"));

    }

  };



  const handleCancel = async () => {

    try {

      await cancelFlirt();

      setStatus("IDLE");

      setCountdown(FLIRT_MATCH_TIMEOUT_SECONDS);

    } catch (err) {

      toast.error(getApiErrorMessage(err, "Không thể huỷ"));

    }

  };



  const flirtBlocked = accountStatus && !accountStatus.flirtAllowed;

  const pendingReport = accountStatus?.pendingReportsAgainstMe > 0;



  return (

    <div className="relative flex flex-col items-center justify-center min-h-[70vh] overflow-hidden">

      <FloatingHearts />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full">

      <h1 className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent animate-fade-up">Thả thính</h1>

      <p className="text-muted-foreground text-center text-sm max-w-sm animate-fade-up stagger-1">

        Hệ thống sẽ ghép bạn với người phù hợp theo sở thích trong hồ sơ

      </p>



      {flirtBlocked && (

        <Alert variant="destructive" className="max-w-sm">

          <ShieldAlert className="h-4 w-4" />

          <AlertTitle>Tài khoản bị khoá</AlertTitle>

          <AlertDescription>

            {accountStatus.flirtBlockReason || "Bạn không thể sử dụng tính năng thả thính."}

          </AlertDescription>

        </Alert>

      )}



      {pendingReport && !flirtBlocked && (

        <Alert className="max-w-sm border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">

          <AlertTriangle className="h-4 w-4 text-amber-600" />

          <AlertTitle className="text-amber-800 dark:text-amber-200">Đang có báo cáo về bạn</AlertTitle>

          <AlertDescription className="text-amber-700 dark:text-amber-300">

            Admin đang xem xét ({accountStatus.pendingReportsAgainstMe} báo cáo chờ duyệt).

            Bạn vẫn có thể thả thính bình thường cho đến khi tài khoản bị khoá.

            {accountStatus.latestReportAgainstMe?.reason && (

              <span className="block mt-1 text-xs opacity-80">

                Lý do gần nhất: {accountStatus.latestReportAgainstMe.reason}

              </span>

            )}

          </AlertDescription>

        </Alert>

      )}



      <Card className="w-full max-w-sm animate-scale-in stagger-2 border-rose-100 dark:border-border shadow-lg shadow-rose-500/5">

        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">

          {status === "WAITING" ? (

            <>

              <motion.div
                className="relative"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >

                <MatchCountdown seconds={countdown} total={FLIRT_MATCH_TIMEOUT_SECONDS} />

              </motion.div>

              <div className="text-center space-y-1">

                <p className="text-muted-foreground">Đang tìm đối tác...</p>

                <p className="text-xs text-muted-foreground">Tối đa {FLIRT_MATCH_TIMEOUT_SECONDS} giây</p>

              </div>

              <Button variant="outline" onClick={handleCancel}>Huỷ chờ</Button>

            </>

          ) : status === "NO_MATCH" ? (

            <EmptyState

              icon={UserX}

              title="Chưa tìm được đối tác"

              description="Hiện chưa có ai phù hợp online. Thử lại sau hoặc điều chỉnh sở thích trong hồ sơ"

              action={

                <Button onClick={handleStart} disabled={flirtBlocked} className="bg-rose-500 hover:bg-rose-600">

                  Thử lại

                </Button>

              }

              className="py-4"

            />

          ) : (

            <>

              <div className="relative flex items-center justify-center h-40 w-40">

                {!flirtBlocked && (
                  <>
                    <span
                      className="absolute h-32 w-32 rounded-full bg-rose-400/30"
                      style={{ animation: "th-ring-ripple 2.4s ease-out infinite" }}
                    />
                    <span
                      className="absolute h-32 w-32 rounded-full bg-rose-400/20"
                      style={{ animation: "th-ring-ripple 2.4s ease-out infinite", animationDelay: "1.2s" }}
                    />
                  </>
                )}

                <motion.button

                  animate={flirtBlocked ? {} : { scale: [1, 1.06, 1] }}

                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}

                  whileTap={{ scale: flirtBlocked ? 1 : 0.92 }}

                  onClick={handleStart}

                  disabled={flirtBlocked}

                  className="relative z-10 h-32 w-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-xl shadow-rose-500/40 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"

                >

                  <Heart className="h-12 w-12 fill-white/90" />

                </motion.button>

              </div>

              <p className="font-medium">{flirtBlocked ? "Không thể thả thính" : "Bấm để thả thính"}</p>

            </>

          )}

        </CardContent>

      </Card>

      {history.length > 0 && (
        <Card className="w-full max-w-sm animate-fade-up stagger-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" /> Lịch sử thả thính
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((h) => (
              <div key={h.sessionId} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={h.partnerAvatarUrl} />
                  <AvatarFallback>{h.partnerNickname?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{h.partnerNickname}</p>
                  <p className="text-xs text-muted-foreground">
                    {h.matchedAt && formatDistanceToNow(new Date(h.matchedAt), { addSuffix: true, locale: vi })}
                    {h.status === "ENDED" && " · Đã kết thúc"}
                    {h.status === "REPORTED" && " · Đã báo cáo"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      </div>

    </div>

  );

}


