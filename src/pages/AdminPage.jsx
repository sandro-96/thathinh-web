import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  getDashboard, listAdminTopics, createTopic, deleteTopic,
  listUsers, banUser, listReports, reviewReport,
} from "@/api/adminApi";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const REPORT_STATUS_LABEL = {
  PENDING: { label: "Chờ duyệt", variant: "destructive" },
  REVIEWED: { label: "Đã xem", variant: "secondary" },
  ACTIONED: { label: "Đã xử lý (ban)", variant: "outline" },
};

function ReportStatusBadge({ status }) {
  const meta = REPORT_STATUS_LABEL[status] || { label: status, variant: "outline" };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [topics, setTopics] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState("PENDING");
  const [newTopic, setNewTopic] = useState({ name: "", description: "", type: "CUSTOM" });

  const loadReports = (status = reportFilter) =>
    listReports(status || undefined)
      .then((r) => setReports(r.data.data || []))
      .catch((err) => toast.error(getApiErrorMessage(err, "Không tải báo cáo")));

  const load = () => {
    getDashboard()
      .then((r) => setDashboard(r.data.data))
      .catch((err) => toast.error(getApiErrorMessage(err, "Không tải dashboard")));
    listAdminTopics()
      .then((r) => setTopics(r.data.data || []))
      .catch((err) => toast.error(getApiErrorMessage(err, "Không tải topics")));
    listUsers()
      .then((r) => setUsers(r.data.data || []))
      .catch((err) => toast.error(getApiErrorMessage(err, "Không tải users")));
    loadReports();
  };

  useEffect(() => { load(); }, []);

  const handleReportFilter = (status) => {
    setReportFilter(status);
    loadReports(status);
  };

  const handleCreateTopic = async () => {
    try {
      await createTopic(newTopic);
      setNewTopic({ name: "", description: "", type: "CUSTOM" });
      load();
      toast.success("Đã tạo topic");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Lỗi tạo topic"));
    }
  };

  const handleReview = async (id, status, note) => {
    try {
      await reviewReport(id, { status, note });
      toast.success(status === "ACTIONED" ? "Đã khoá tài khoản vi phạm" : "Đã cập nhật báo cáo");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể xử lý báo cáo"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="text-xl sm:text-2xl font-bold">Admin</h1>
        <Link to="/topics" className="text-sm text-muted-foreground">← Về app</Link>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["Tổng user", dashboard.totalUsers],
            ["User mới hôm nay", dashboard.newUsersToday],
            ["DAU (ước tính)", dashboard.dailyActiveUsers],
            ["Tin nhắn hôm nay", dashboard.messagesToday],
            ["Flirt hôm nay", dashboard.flirtSessionsToday],
            ["Match hôm nay", dashboard.flirtMatchesToday],
            ["Tỷ lệ match", `${dashboard.matchRatePercent ?? 0}%`],
            ["Báo cáo chờ", dashboard.pendingReports],
          ].map(([label, val], i) => (
            <Card
              key={label}
              className="animate-fade-up hover:-translate-y-0.5 transition-transform"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <CardContent className="pt-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-rose-600">{val}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Tạo topic mới</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Tên topic" value={newTopic.name} onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })} />
              <Input placeholder="Mô tả" value={newTopic.description} onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })} />
              <Button onClick={handleCreateTopic} className="bg-rose-500 hover:bg-rose-600">Tạo</Button>
            </CardContent>
          </Card>
          {topics.map((t) => (
            <Card key={t.id}>
              <CardContent className="pt-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.memberCount} thành viên</div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteTopic(t.id).then(load)}>Xoá</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-2">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="pt-4 flex justify-between items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{u.nickname}</span>
                    {u.banned && <Badge variant="destructive">Đã ban</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">{u.email}</div>
                </div>
                <Button
                  variant={u.banned ? "outline" : "destructive"}
                  size="sm"
                  onClick={() => banUser(u.id, !u.banned).then(load)}
                >
                  {u.banned ? "Gỡ ban" : "Ban"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["PENDING", "REVIEWED", "ACTIONED"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={reportFilter === s ? "default" : "outline"}
                onClick={() => handleReportFilter(s)}
              >
                {REPORT_STATUS_LABEL[s]?.label || s}
              </Button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Luồng: User báo cáo → báo cáo <strong>PENDING</strong> (user bị báo cáo vẫn thả thính được)
            → Admin &quot;Đã xem&quot; (REVIEWED, không ban) hoặc &quot;Ban user&quot; (ACTIONED, khoá tài khoản).
          </p>

          {reports.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Không có báo cáo nào</p>
          )}

          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ReportStatusBadge status={r.status} />
                  {r.reportedBanned && <Badge variant="destructive">User đã bị ban</Badge>}
                  {r.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(r.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Người báo cáo: </span>
                    <span className="font-medium">{r.reporterNickname}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bị báo cáo: </span>
                    <span className="font-medium text-rose-600">{r.reportedNickname}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Lý do: </span>
                  {r.reason}
                </div>

                {r.adminNote && (
                  <div className="text-xs text-muted-foreground">Ghi chú admin: {r.adminNote}</div>
                )}

                <div className="text-xs text-muted-foreground font-mono">
                  Session: {r.sessionId}
                </div>

                {r.status === "PENDING" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(r.id, "REVIEWED", "Đã xem, không vi phạm")}
                    >
                      Đã xem — không ban
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReview(r.id, "ACTIONED", "Vi phạm — đã khoá tài khoản")}
                    >
                      Xác nhận vi phạm &amp; Ban
                    </Button>
                  </div>
                )}

                {r.status === "ACTIONED" && r.reportedBanned && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => banUser(r.reportedId, false).then(load)}
                  >
                    Gỡ ban user
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
