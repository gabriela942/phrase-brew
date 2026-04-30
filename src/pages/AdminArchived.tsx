import { Archive } from "lucide-react";
import { HistorySubmissionsView } from "@/components/admin/HistorySubmissionsView";

const AdminArchived = () => (
  <HistorySubmissionsView
    title="Arquivados"
    subtitle="Histórico de submissões retiradas da fila principal."
    icon={Archive}
    queryKey="admin-archived-submissions"
    statusValues={["archived"]}
    dateColumnLabel="Arquivada em"
    actions={{ restore: true, delete: true }}
  />
);

export default AdminArchived;
