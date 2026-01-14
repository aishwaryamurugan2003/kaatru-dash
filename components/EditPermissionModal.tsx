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
      preloadUserGroup();
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
      PREFILL SELECTED GROUP + DEVICES
  ------------------------------------------------------------ */
  const preloadUserGroup = () => {
    if (!user?.access || user.access.length === 0) return;

    const g = user.access[0];

    const group = { label: g.group_name, value: g.group_id };
    setSelectedGroup(group);

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
      FIX: FETCH EXISTING ACCESS CORRECTLY
  ------------------------------------------------------------ */
  const fetchExistingUserAccess = async (userId: string) => {
    const res = await apiService.get(Endpoint.ACCESS_MANAGEMENT);

    if (!Array.isArray(res?.data)) return [];

    const found = res.data.find((u: any) => u.user_id === userId);

    return found?.access || [];
  };

  /* ------------------------------------------------------------
      SAVE (MERGE OLD + NEW)
  ------------------------------------------------------------ */
  const saveChanges = async () => {
    if (!selectedGroup) return;

    const userId = user.key;

    // 1️⃣ Get all existing groups from full list
    const existingAccess = await fetchExistingUserAccess(userId);

    // 2️⃣ Build updated entry
    const updatedEntry = {
      group_id: selectedGroup.value,
      group_name: selectedGroup.label,
      devices: selectedDevice.map((d) => d.value),
    };

    // 3️⃣ Merge
    const mergedAccess = [
      ...existingAccess.filter(a => a.group_id !== updatedEntry.group_id),
      updatedEntry,
    ];

    const payload = {
      user_id: userId,
      access: mergedAccess,
    };

    console.log("FINAL EDIT PAYLOAD:", payload);

    // 4️⃣ Save
    await apiService.put(Endpoint.ACCESS_MANAGEMENT_SYNC, payload);

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
