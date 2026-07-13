import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, uploadAvatar, addProfilePhoto, removeProfilePhoto } from "@/api/userApi";
import { logout as apiLogout } from "@/api/authApi";
import { listBlockedUsers, unblockUser } from "@/api/friendApi";
import { isProfileComplete } from "@/lib/profile";
import { validateNickname } from "@/lib/nicknameValidation";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickableAvatar } from "@/components/ui/clickable-avatar";
import { NotificationSettingsCard } from "@/components/NotificationSettingsCard";
import { AlertCircle, Ban, Camera, Heart, LogOut, User as UserIcon, Loader2, Plus, X, ImagePlus, Sparkles } from "lucide-react";

function maxBirthDateFor18Plus() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
}

function defaultLookingFor(gender) {
  if (gender === "MALE") return ["FEMALE"];
  if (gender === "FEMALE") return ["MALE"];
  return [];
}

const GENDERS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const LOOKING = [
  { value: "ALL", label: "Tất cả" },
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

function Segmented({ options, value, onChange }) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg py-2 text-sm font-medium transition-colors",
            value === o.value
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function formFromProfile(profile) {
  if (!profile) return null;
  return {
    nickname: profile.nickname || "",
    gender: profile.gender || "OTHER",
    birthDate: profile.birthDate || "",
    minAge: profile.preferences?.minAge || 18,
    maxAge: profile.preferences?.maxAge || 60,
    lookingFor: profile.preferences?.lookingFor?.length
      ? profile.preferences.lookingFor
      : defaultLookingFor(profile.gender || "OTHER"),
    bio: profile.bio || "",
    interests: profile.interests || [],
  };
}

function applyProfileToUser(prev, profile) {
  if (!prev || !profile) return prev;
  return {
    ...prev,
    email: profile.email ?? prev.email,
    nickname: profile.nickname,
    avatarUrl: profile.avatarUrl,
    gender: profile.gender,
    birthDate: profile.birthDate,
    preferences: profile.preferences,
    profileComplete: profile.profileComplete,
    verified: profile.verified !== false,
    bio: profile.bio,
    interests: profile.interests,
    photos: profile.photos,
  };
}

export default function ProfilePage() {
  const { user, setUser, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "1" || !isProfileComplete(user);

  const [nicknameError, setNicknameError] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [interestInput, setInterestInput] = useState("");
  const [form, setForm] = useState({
    nickname: "",
    gender: "OTHER",
    birthDate: "",
    minAge: 18,
    maxAge: 60,
    lookingFor: [],
    bio: "",
    interests: [],
  });

  const maxBirthDate = maxBirthDateFor18Plus();
  const isDirtyRef = useRef(false);
  const saveEpochRef = useRef(0);
  const hydrateGenRef = useRef(0);

  useEffect(() => {
    if (user?.id && !isDirtyRef.current) {
      const seed = formFromProfile(user);
      if (seed) setForm(seed);
    }

    const gen = ++hydrateGenRef.current;
    let cancelled = false;
    (async () => {
      const profile = await refreshProfile();
      if (cancelled || gen !== hydrateGenRef.current) return;
      if (!profile || isDirtyRef.current) return;
      const next = formFromProfile(profile);
      if (next) setForm(next);
    })();
    return () => {
      cancelled = true;
      hydrateGenRef.current += 1;
    };
  }, [refreshProfile]);

  const patchForm = useCallback((patch) => {
    isDirtyRef.current = true;
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const loadBlocked = () => {
    if (isOnboarding) return;
    setBlockedLoading(true);
    listBlockedUsers()
      .then((res) => setBlockedUsers(res.data.data || []))
      .catch(() => setBlockedUsers([]))
      .finally(() => setBlockedLoading(false));
  };

  useEffect(() => {
    if (!isOnboarding) loadBlocked();
  }, [isOnboarding]);

  const handleUnblock = async (userId) => {
    try {
      await unblockUser(userId);
      toast.success("Đã bỏ chặn");
      loadBlocked();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể bỏ chặn"));
    }
  };

  const save = async () => {
    const nickErr = validateNickname(form.nickname);
    if (nickErr) {
      setNicknameError(nickErr);
      toast.error(nickErr);
      return;
    }
    if (!form.birthDate) {
      toast.error("Vui lòng chọn ngày sinh");
      return;
    }
    hydrateGenRef.current += 1;
    setSaving(true);
    const epoch = ++saveEpochRef.current;
    try {
      const res = await updateProfile({
        nickname: form.nickname.trim(),
        gender: form.gender,
        birthDate: form.birthDate,
        preferences: {
          minAge: Number(form.minAge),
          maxAge: Number(form.maxAge),
          lookingFor: form.lookingFor,
        },
        bio: form.bio.trim(),
        interests: form.interests,
      });
      const profile = res.data.data;
      const next = formFromProfile(profile);
      isDirtyRef.current = false;
      if (next) setForm(next);
      setUser((prev) => applyProfileToUser(prev, profile));
      const complete = profile?.profileComplete;
      toast.success(complete ? "Hồ sơ đã hoàn thiện!" : "Đã cập nhật hồ sơ");
      if (complete && isOnboarding) {
        navigate("/topics");
      }
    } catch (err) {
      if (epoch === saveEpochRef.current) {
        toast.error(getApiErrorMessage(err, "Lỗi cập nhật"));
      }
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 512 });
      await uploadAvatar(compressed);
      await refreshProfile();
      toast.success("Đã cập nhật avatar");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể cập nhật avatar"));
    } finally {
      setAvatarUploading(false);
    }
  };

  const onAddPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280 });
      await addProfilePhoto(compressed);
      await refreshProfile();
      toast.success("Đã thêm ảnh");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể thêm ảnh"));
    } finally {
      setPhotoUploading(false);
    }
  };

  const onRemovePhoto = async (url) => {
    try {
      await removeProfilePhoto(url);
      await refreshProfile();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể xoá ảnh"));
    }
  };

  const addInterest = () => {
    const t = interestInput.trim();
    if (!t) return;
    if (t.length > 30) {
      toast.error("Mỗi sở thích tối đa 30 ký tự");
      return;
    }
    if (form.interests.includes(t)) {
      setInterestInput("");
      return;
    }
    if (form.interests.length >= 10) {
      toast.error("Tối đa 10 sở thích");
      return;
    }
    setForm({ ...form, interests: [...form.interests, t] });
    isDirtyRef.current = true;
    setInterestInput("");
  };

  const removeInterest = (t) => {
    isDirtyRef.current = true;
    setForm({ ...form, interests: form.interests.filter((i) => i !== t) });
  };

  const handleLogout = async () => {
    const rt = localStorage.getItem("refreshToken");
    if (rt) await apiLogout(rt).catch(() => {});
    logout();
  };

  const lookingForValue = form.lookingFor.length === 0 ? "ALL" : form.lookingFor[0];

  return (
    <div className="space-y-5 pb-4">
      <h1 className="text-xl sm:text-2xl font-bold animate-fade-up">
        {isOnboarding ? "Hoàn thiện hồ sơ" : "Hồ sơ"}
      </h1>

      {isOnboarding && (
        <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 p-4 text-sm text-rose-900 dark:text-rose-100 animate-fade-up stagger-1">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Chào mừng bạn đến Thả Thính!</p>
            <p className="mt-1 text-rose-800/90 dark:text-rose-100/80">
              Hãy điền nickname, giới tính và ngày sinh để có thể <strong>thả thính</strong>.
              Bạn vẫn có thể xem và chat topic trước khi hoàn thiện.
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <Card className="overflow-hidden gap-0 py-0 animate-fade-up stagger-1">
        <div className="h-24 bg-gradient-to-r from-rose-400 to-pink-500 animate-gradient-pan" />
        <CardContent className="pt-0 pb-5">
          <div className="flex items-end gap-4 -mt-10">
            <div className="relative shrink-0">
              <ClickableAvatar
                className="h-20 w-20 ring-4 ring-background"
                src={user?.avatarUrl}
                alt="Ảnh đại diện của bạn"
                fallback={user?.nickname?.[0]}
                fallbackClassName="text-2xl"
              />
              <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-background hover:bg-rose-600 transition-colors cursor-pointer">
                {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                <input type="file" accept="image/*" hidden onChange={onAvatar} />
              </label>
            </div>
            <div className="min-w-0 pb-1">
              <p className="font-semibold text-lg truncate">{user?.nickname || "Chưa đặt nickname"}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thông tin cơ bản */}
      <Card className="animate-fade-up stagger-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-rose-500" /> Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nickname *</Label>
            <Input
              value={form.nickname}
              onChange={(e) => {
                patchForm({ nickname: e.target.value });
                setNicknameError(validateNickname(e.target.value) || "");
              }}
              placeholder="3–20 ký tự"
              minLength={3}
              maxLength={20}
              required
            />
            {nicknameError && <p className="text-xs text-destructive">{nicknameError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Giới tính *</Label>
            <Segmented
              options={GENDERS}
              value={form.gender}
              onChange={(v) => patchForm({ gender: v, lookingFor: defaultLookingFor(v) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Ngày sinh * (từ 18 tuổi)</Label>
            <Input
              type="date"
              value={form.birthDate}
              max={maxBirthDate}
              onChange={(e) => patchForm({ birthDate: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Giới thiệu & sở thích */}
      <Card className="animate-fade-up stagger-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-rose-500" /> Giới thiệu bản thân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tiểu sử</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => patchForm({ bio: e.target.value })}
              placeholder="Vài dòng về bạn, sở thích, điều bạn tìm kiếm..."
              maxLength={300}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{form.bio.length}/300</p>
          </div>
          <div className="space-y-1.5">
            <Label>Sở thích (tối đa 10)</Label>
            <div className="flex gap-2">
              <Input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
                placeholder="VD: du lịch, cà phê, đọc sách"
                maxLength={30}
              />
              <Button type="button" variant="outline" size="icon" onClick={addInterest} aria-label="Thêm sở thích">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.interests.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-200 px-3 py-1 text-sm"
                  >
                    {t}
                    <button type="button" onClick={() => removeInterest(t)} aria-label={`Xoá ${t}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ảnh của bạn */}
      <Card className="animate-fade-up stagger-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-rose-500" /> Ảnh của bạn
          </CardTitle>
          <p className="text-xs text-muted-foreground">Tối đa 6 ảnh để hồ sơ sinh động hơn</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {(user?.photos || []).map((url) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden border group">
                <img src={url} alt="Ảnh hồ sơ" className="h-full w-full object-cover" loading="lazy" />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(url)}
                  aria-label="Xoá ảnh"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-black/80 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {(user?.photos?.length || 0) < 6 && (
              <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-rose-400 hover:text-rose-500 transition">
                {photoUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[11px]">Thêm ảnh</span>
                  </>
                )}
                <input type="file" accept="image/*" hidden onChange={onAddPhoto} disabled={photoUploading} />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sở thích ghép đôi */}
      <Card className="animate-fade-up stagger-3">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" /> Sở thích ghép đôi
          </CardTitle>
          <p className="text-xs text-muted-foreground">Dùng để ghép đôi khi thả thính</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Muốn gặp</Label>
            <Segmented
              options={LOOKING}
              value={lookingForValue}
              onChange={(v) => patchForm({ lookingFor: v === "ALL" ? [] : [v] })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Độ tuổi muốn gặp</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="block text-xs text-muted-foreground">Tối thiểu</span>
                <Input
                  type="number"
                  min={18}
                  value={form.minAge}
                  onChange={(e) => patchForm({ minAge: Number(e.target.value) || 18 })}
                />
              </div>
              <div className="space-y-1">
                <span className="block text-xs text-muted-foreground">Tối đa</span>
                <Input
                  type="number"
                  min={18}
                  value={form.maxAge}
                  onChange={(e) => patchForm({ maxAge: Number(e.target.value) || 60 })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-2 animate-fade-up stagger-4">
        <Button onClick={save} disabled={saving} className="bg-rose-500 hover:bg-rose-600 flex-1">
          {saving ? "Đang lưu..." : isOnboarding ? "Hoàn tất & tiếp tục" : "Lưu thay đổi"}
        </Button>
        {!isOnboarding && (
          <Button variant="outline" onClick={handleLogout} className="gap-1.5">
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Button>
        )}
      </div>

      {!isOnboarding && <NotificationSettingsCard />}

      {!isOnboarding && (
        <Card className="animate-fade-up stagger-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ban className="h-4 w-4 text-muted-foreground" /> Người đã chặn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockedLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải...</p>
            ) : blockedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bạn chưa chặn ai.</p>
            ) : (
              blockedUsers.map((b) => (
                <div key={b.userId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <ClickableAvatar
                      className="h-9 w-9"
                      src={b.avatarUrl}
                      alt={`Ảnh đại diện của ${b.nickname}`}
                      fallback={b.nickname?.[0]}
                    />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{b.nickname}</p>
                      {b.blockedAt && (
                        <p className="text-xs text-muted-foreground">
                          Chặn {formatDistanceToNow(new Date(b.blockedAt), { addSuffix: true, locale: vi })}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleUnblock(b.userId)}>
                    Bỏ chặn
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {!isOnboarding && (
        <p className="text-xs text-muted-foreground text-center">
          <Link to="/terms" className="underline hover:text-foreground">Điều khoản</Link>
          {" · "}
          <Link to="/privacy" className="underline hover:text-foreground">Quyền riêng tư</Link>
        </p>
      )}
    </div>
  );
}
