import { toast } from "sonner";

import { NewPersonalRecordToast } from "../components/NewPersonalRecordToast";
import type { NewPersonalRecord } from "../types/performance";

export function showNewPersonalRecordToasts(records: NewPersonalRecord[]) {
  records.forEach((record) => {
    toast.custom(() => <NewPersonalRecordToast record={record} />, {
      duration: 6000,
    });
  });
}
