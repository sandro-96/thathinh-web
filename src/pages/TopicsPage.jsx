import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, MessageCircle, Compass, Search } from "lucide-react";
import { toast } from "sonner";
import { listTopics } from "@/api/topicApi";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function TopicsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const TOPIC_TYPES = [
  { value: "", label: "Tất cả" },
  { value: "PROVINCE", label: "Tỉnh thành" },
  { value: "CLUB", label: "CLB / Sở thích" },
  { value: "CUSTOM", label: "Khác" },
];

function TopicCard({ topic, index = 0 }) {
  return (
    <Link to={`/topics/${topic.slug}`} className="block h-full">
      <Card
        className="h-full hover:border-rose-300 hover:-translate-y-0.5 hover:shadow-md transition-all animate-fade-up"
        style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center justify-between gap-2">
            <span className="truncate">{topic.name}</span>
            {topic.joined && <Badge variant="secondary" className="shrink-0">Đã tham gia</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-rose-600">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {topic.memberCount} thành viên
            </span>
            {topic.onlineCount > 0 && (
              <span className="text-xs text-emerald-600 font-medium">
                {topic.onlineCount} đang online
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [query, setQuery] = useState({ search: "", type: "" });

  const load = () => {
    setLoading(true);
    const params = {};
    if (query.search) params.search = query.search;
    if (query.type) params.type = query.type;
    listTopics(params)
      .then((res) => setTopics(res.data.data || []))
      .catch((err) => toast.error(getApiErrorMessage(err, "Không tải được danh sách topic")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery({ search: search.trim(), type: typeFilter });
  };

  const joinedTopics = useMemo(() => topics.filter((t) => t.joined), [topics]);
  const otherTopics = useMemo(() => topics.filter((t) => !t.joined), [topics]);

  if (loading && topics.length === 0) {
    return <TopicsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-xl sm:text-2xl font-bold">Phòng trò chuyện</h1>
        <p className="text-muted-foreground text-sm">Tham gia topic theo địa điểm hoặc sở thích</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Tìm theo tên hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TOPIC_TYPES.map(({ value, label }) => (
            <Button
              key={value || "all"}
              type="button"
              size="sm"
              variant={typeFilter === value ? "default" : "outline"}
              className={cn(typeFilter === value && "bg-rose-500 hover:bg-rose-600")}
              onClick={() => setTypeFilter(value)}
            >
              {label}
            </Button>
          ))}
          <Button type="submit" size="sm" className="bg-rose-500 hover:bg-rose-600">Tìm</Button>
        </div>
      </form>

      {topics.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Không tìm thấy phòng"
          description="Thử từ khóa khác hoặc bỏ bộ lọc loại topic"
        />
      ) : (
        <>
          {joinedTopics.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Đã tham gia</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {joinedTopics.map((topic, i) => <TopicCard key={topic.id} topic={topic} index={i} />)}
              </div>
            </section>
          )}

          {otherTopics.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                {joinedTopics.length > 0 ? "Khám phá thêm" : "Tất cả phòng"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {otherTopics.map((topic, i) => <TopicCard key={topic.id} topic={topic} index={i} />)}
              </div>
            </section>
          )}

          {joinedTopics.length === 0 && otherTopics.length > 0 && (
            <EmptyState
              icon={Compass}
              title="Bạn chưa tham gia phòng nào"
              description="Chọn một phòng bên dưới và bấm tham gia để bắt đầu trò chuyện"
              className="py-6"
            />
          )}
        </>
      )}
    </div>
  );
}
