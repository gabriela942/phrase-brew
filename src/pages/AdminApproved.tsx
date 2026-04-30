import { CheckCircle2 } from "lucide-react";
import { HistorySubmissionsView } from "@/components/admin/HistorySubmissionsView";

const AdminApproved = () => (
  <HistorySubmissionsView
    title="Aprovados"
    subtitle="Modelos já aprovados e liberados no fluxo principal."
    icon={CheckCircle2}
    queryKey="admin-approved-submissions"
    statusValues={["approved"]}
    dateColumnLabel="Aprovada em"
    actions={{ reject: true, archive: true, delete: true }}
  />
);

export default AdminApproved;
