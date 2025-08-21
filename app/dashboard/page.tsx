import { InterventionsChart } from "./InterventionsChart";
import { NextInterventions } from "./nextInterventions";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row gap-5">
        <div className="w-full md:w-1/3">
          <NextInterventions />
        </div>
        <div className="w-full md:w-2/3">
          <InterventionsChart />
        </div>
      </div>
    </div>
  );
}
