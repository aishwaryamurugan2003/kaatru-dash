import React, { useEffect, useState } from "react";
import Select from "react-select";
import { apiService } from "../services/api";
import { Endpoint } from "../services/api";

interface Option {
  label: string;
  value: string;
}

const EditPermissionModal = ({ isOpen, onClose, user, onUpdated }) => {
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [deviceOptions, setDeviceOptions] = useState<Option[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Option | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Option[]>([]);

  useEffect(() => {
    if (user) {
      fetchGroups();
      preloadFirstUserGroup();
    }
  }, [user]);

  /* ------------------------------------------------------------
      LOAD ALL GROUPS
  ------------------------------------------------------------ */
  const fetchGroups = async () => {
    const res = await apiService.getRamanAnalysis(Endpoint.GROUP_ALL);

    if (Array.isArray(res?.data)) {
      setGroupOptions(
        res.data.map((g: any) => ({
          label: g.name,
          value: g.id,
        }))
      );
    }
  };

  /* ------------------------------------------------------------
      PREFILL (FIRST GROUP ONLY – EDIT MODE)
  ------------------------------------------------------------ */
  const preloadFirstUserGroup = () => {
    if (!user?.access || user.access.length === 0) return;

    const g = user.access[0];

    setSelectedGroup({
      label: g.group_name,
      value: g.group_id,
    });

    fetchDevices(g.group_id, g.devices);
  };

  /* ------------------------------------------------------------
      FETCH DEVICE LIST
  ------------------------------------------------------------ */
  const fetchDevices = async (groupId: string, preselected?: string[]) => {
    const res = await apiService.getRamanAnalysis(Endpoint.GROUP_DEVICES, {
      id: groupId,
    });

    if (res?.data?.devices) {
      const options = res.data.devices.map((d: string) => ({
        label: d,
        value: d,
      }));

      setDeviceOptions(options);

      if (preselected) {
        setSelectedDevice(
          preselected.map((d) => ({ label: d, value: d }))
        );
      }
    }
  };

  const onGroupChange = (g: Option | null) => {
    setSelectedGroup(g);
    setSelectedDevice([]);
    if (g) fetchDevices(g.value);
  };

  /* ------------------------------------------------------------
      SAVE (SAFE MERGE + SYNC)
  ------------------------------------------------------------ */
  const saveChanges = async () => {
    if (!selectedGroup) return;

    const userId = user.key;

    // 1️⃣ Fetch FULL existing access (single-user source)
    const existingAccess = await apiService.getUserFullAccess(userId);

    // 2️⃣ Build updated group entry
    const updatedEntry = {
      group_id: selectedGroup.value,
      group_name: selectedGroup.label,
      devices: selectedDevice.map((d) => d.value),
    };

    // 3️⃣ Merge safely (replace only same group)
    const mergedAccess = [
      ...existingAccess.filter(
        (a) => a.group_id !== updatedEntry.group_id
      ),
      updatedEntry,
    ];

    // 🔒 Safety guard
    if (mergedAccess.length < existingAccess.length) {
      alert("Unsafe update blocked (possible data loss)");
      return;
    }

    console.log(
      "FINAL EDIT SYNC PAYLOAD:",
      JSON.stringify(
        { user_id: userId, access: mergedAccess },
        null,
        2
      )
    );

    // 4️⃣ Sync using centralized helper
    await apiService.syncUserAccess(userId, mergedAccess);

    onUpdated();
    onClose();
  };

  /* ------------------------------------------------------------
      UI
  ------------------------------------------------------------ */
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[500px]">
        <h2 className="text-xl font-bold mb-4">Edit Permission</h2>

        <label>User</label>
        <input
          value={user?.username}
          disabled
          className="border px-3 py-2 mb-4 w-full bg-gray-100"
        />

        <label>Group</label>
        <Select
          options={groupOptions}
          value={selectedGroup}
          onChange={onGroupChange}
          className="mb-4"
        />

        <label>Devices</label>
        <Select
          isMulti
          options={deviceOptions}
          value={selectedDevice}
          onChange={(v) => setSelectedDevice(v as Option[])}
          className="mb-4"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={saveChanges}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPermissionModal;
