import { XCircle } from "lucide-react";
import { HistorySubmissionsView } from "@/components/admin/HistorySubmissionsView";

const AdminRejected = () => (
  <HistorySubmissionsView
    title="Reprovados"
    subtitle="Submissões recusadas na moderação."
    icon={XCircle}
    queryKey="admin-rejected-submissions"
    statusValues={["rejected"]}
    dateColumnLabel="Reprovada em"
    actions={{ approve: true, archive: true, delete: true }}
  />
);

export default AdminRejected;
