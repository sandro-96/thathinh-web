import { useCallback, useState } from "react";
import { toast } from "sonner";
import { MapPin, Navigation, Loader2, UserPlus, Check, Clock, RefreshCw, Users, EyeOff } from "lucide-react";
import { getNearby } from "@/api/nearbyApi";
import { updateLocation, disableLocation } from "@/api/userApi";
import { sendFriendRequest } from "@/api/friendApi";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { genderChipClass, genderLabel } from "@/lib/gender";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GenderAvatar } from "@/components/ui/gender-avatar";

const RADIUS_OPTIONS = [5, 10, 25, 50];
const MIN_SEARCH_MS = 1300;

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km} km`;
}

export default function NearbyPage() {
  const [radius, setRadius] = useState(10);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [located, setLocated] = useState(false);
  const [sending, setSending] = useState(null);

  const fetchNearby = useCallback(async (r) => {
    setLoading(true);
    const startedAt = Date.now();
    try {
      const res = await getNearby(r);
      // Giữ animation radar tối thiểu MIN_SEARCH_MS để "có cảm giác đang tìm"
      // mà không cố tình làm chậm khi API/mạng chậm.
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_SEARCH_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SEARCH_MS - elapsed));
      }
      setPeople(res.data.data || []);
      setLocated(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể tải danh sách quanh đây"));
    } finally {
      setLoading(false);
    }
  }, []);

  const enableAndSearch = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast.error("Thiết bị không hỗ trợ định vị");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateLocation(pos.coords.latitude, pos.coords.longitude);
          await fetchNearby(radius);
        } catch (err) {
          toast.error(getApiErrorMessage(err, "Không thể cập nhật vị trí"));
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Bạn cần cho phép truy cập vị trí để dùng tính năng này");
        } else {
          toast.error("Không lấy được vị trí, vui lòng thử lại");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [radius, fetchNearby]);

  const changeRadius = (r) => {
    setRadius(r);
    if (located) fetchNearby(r);
  };

  const turnOffLocation = async () => {
    try {
      await disableLocation();
      setLocated(false);
      setPeople([]);
      toast.success("Đã tắt chia sẻ vị trí");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể tắt chia sẻ vị trí"));
    }
  };

  const handleAddFriend = async (userId) => {
    setSending(userId);
    try {
      await sendFriendRequest(userId);
      setPeople((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, friendshipStatus: "PENDING" } : p))
      );
      toast.success("Đã gửi lời mời kết bạn");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể gửi lời mời"));
    } finally {
      setSending(null);
    }
  };

  const friendButton = (p) => {
    if (p.friendshipStatus === "ACCEPTED") {
      return (
        <Button size="sm" variant="outline" disabled className="gap-1.5 shrink-0">
          <Check className="h-4 w-4" /> Bạn bè
        </Button>
      );
    }
    if (p.friendshipStatus === "PENDING") {
      return (
        <Button size="sm" variant="outline" disabled className="gap-1.5 shrink-0">
          <Clock className="h-4 w-4" /> Đã gửi
        </Button>
      );
    }
    return (
      <Button
        size="sm"
        onClick={() => handleAddFriend(p.userId)}
        disabled={sending === p.userId}
        className="gap-1.5 shrink-0 bg-rose-500 hover:bg-rose-600"
      >
        {sending === p.userId ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Kết bạn
      </Button>
    );
  };

  return (
    <div className="space-y-5 pb-4">
      <div className="animate-fade-up">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-rose-500" /> Quanh đây
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tìm những người đang ở gần bạn. Vị trí chỉ dùng để tính khoảng cách và bạn có thể tắt chia sẻ bất cứ lúc nào.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 animate-fade-up stagger-1">
        <span className="text-sm text-muted-foreground">Bán kính:</span>
        {RADIUS_OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => changeRadius(r)}
            className={cn(
              "rounded-full px-3 py-1 text-sm border transition-colors",
              radius === r
                ? "bg-rose-500 text-white border-rose-500"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {r} km
          </button>
        ))}
        {located && (
          <div className="ml-auto flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={enableAndSearch}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Làm mới
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={turnOffLocation}
              className="gap-1.5 text-muted-foreground"
            >
              <EyeOff className="h-4 w-4" /> Tắt vị trí
            </Button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-14 gap-5 animate-fade-up">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-rose-400/25 animate-ping" />
            <span className="absolute inset-3 rounded-full bg-rose-400/20 animate-ping [animation-delay:0.4s]" />
            <span className="absolute inset-6 rounded-full bg-rose-400/15 animate-ping [animation-delay:0.8s]" />
            <div className="relative h-16 w-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Navigation className="h-7 w-7 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Đang tìm người quanh đây...</p>
        </div>
      )}

      {!loading && !located && (
        <Card className="animate-fade-up stagger-2">
          <CardContent className="flex flex-col items-center text-center gap-3 py-10">
            <div className="h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center text-rose-500">
              <Navigation className="h-7 w-7" />
            </div>
            <div>
              <p className="font-medium">Bật vị trí để bắt đầu</p>
              <p className="text-sm text-muted-foreground mt-1">
                Chúng tôi cần vị trí của bạn để tìm người ở gần.
              </p>
            </div>
            <Button onClick={enableAndSearch} className="bg-rose-500 hover:bg-rose-600 gap-1.5">
              <Navigation className="h-4 w-4" />
              Bật vị trí & tìm
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && located && people.length === 0 && (
        <Card className="animate-fade-up">
          <CardContent className="flex flex-col items-center text-center gap-3 py-10 text-muted-foreground">
            <Users className="h-8 w-8" />
            <div>
              <p>Chưa có ai trong bán kính {radius} km.</p>
              <p className="text-sm">Thử tăng bán kính hoặc tìm lại nhé.</p>
            </div>
            <Button onClick={enableAndSearch} className="bg-rose-500 hover:bg-rose-600 gap-1.5">
              <RefreshCw className="h-4 w-4" /> Tìm lại
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && located && people.length > 0 && (
        <div className="space-y-2">
          {people.map((p) => (
            <Card key={p.userId} className="animate-fade-up">
              <CardContent className="flex items-center gap-3 py-3">
                <GenderAvatar
                  gender={p.gender}
                  className="h-12 w-12 shrink-0"
                  src={p.avatarUrl}
                  alt={`Ảnh đại diện của ${p.nickname}`}
                  fallback={p.nickname?.[0]}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="font-medium truncate min-w-0">{p.nickname}</p>
                    {p.age > 0 && (
                      <span className="text-sm text-muted-foreground shrink-0">{p.age}</span>
                    )}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0",
                        genderChipClass(p.gender)
                      )}
                    >
                      {genderLabel(p.gender)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">Cách bạn {formatDistance(p.distanceKm)}</span>
                  </p>
                  {p.bio && <p className="text-sm text-muted-foreground truncate mt-0.5">{p.bio}</p>}
                </div>
                {friendButton(p)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
