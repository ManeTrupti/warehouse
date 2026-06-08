import React from "react";
import CommonModal from "@shared/components/CommonModal";
import GenericSearchSelect from "@shared/components/CommonSearchingSelect/GenericSearchingSelect";

function TicketRaisedModal({
  isOpen,
  onClose,
  resources,
  breakdownTypes,
  form,
  errors,
  handleChange,
  onSubmit,
}) {

  const selectedResource = React.useMemo(() => {
    if (!form.resource) return null;
    return resources.find(r => r.id === Number(form.resource)) || null;
  }, [resources, form.resource]);

  const workstationOptions = React.useMemo(() => {
    if (!selectedResource || !Array.isArray(selectedResource.workstations)) {
      return [];
    }

    return selectedResource.workstations.map(ws => ({
      label: ws.workstation_name || ws.workstation_code,
      value: ws.id
    }));
  }, [selectedResource]);

  
  
  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-600 font-semibold">
          <span>⚠</span> Breakdown Intimation Form
        </div>
      }
    >
      <div className="space-y-5">
        {/* Section */}
        <div>
          <GenericSearchSelect
            label="Section"
            required
            options={resources.map((res) => ({
              label: res.resource_name,
              value: res.id,
            }))}
            value={form.resource}
            onChange={(val) => handleChange("resource", val)}
            error={errors.resource}
            placeholder="Select Section"
          />
        </div>

        {/* Work Station */}
        <div>
          <GenericSearchSelect
            label="Work Station"
            required
            options={workstationOptions}
            value={form.workstation}
            onChange={(val) => handleChange("workstation", val)}
            error={errors.workstation}
            placeholder="Select Work Station"
            disabled={!form.resource || workstationOptions.length === 0}
          />
        </div>

        {/* Breakdown Type */}
        <div>
          <GenericSearchSelect
            label="Breakdown Type"
            required
            options={breakdownTypes.map((type) => ({
              label:  `${type.name} (${type.breakdown_code})`,
              value: type.id,
            }))}
            value={form.breakdownType}
            onChange={(val) => handleChange("breakdownType", val)}
            error={errors.breakdownType}
            placeholder="Select Breakdown Type"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="text-sm font-medium">Reason *</label>
          <input
            value={form.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            placeholder="Brief description of breakdown"
            className={`mt-2 h-11 w-full border rounded-lg px-4 text-sm ${
              errors.reason ? "border-red-500" : ""
            }`}
          />
          {errors.reason && (
            <p className="text-red-600 text-xs mt-1">{errors.reason}</p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="text-sm font-medium">Remarks</label>
          <textarea
            value={form.remark}
            onChange={(e) => handleChange("remark", e.target.value)}
            rows="3"
            className={`mt-2 w-full border rounded-lg px-4 py-3 text-sm ${
              errors.remark ? "border-red-500" : ""
            }`}
          />
          {errors.remark && (
            <p className="text-red-600 text-xs mt-1">{errors.remark}</p>
          )}
        </div>

        {/* Start Time Box */}
        <div className="bg-gray-100 rounded-lg p-4 text-sm">
          <p className="font-medium">
            Start Time: {new Date().toLocaleTimeString()}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Timer will start automatically upon submission
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-300 bg-gray-50 text-sm text-gray-800 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
          >
            Raise Ticket
          </button>
        </div>
      </div>
    </CommonModal>
  );
}

export default TicketRaisedModal;
