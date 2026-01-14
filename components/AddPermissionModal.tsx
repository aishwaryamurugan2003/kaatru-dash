import React, { useEffect, useState } from "react";
import Select from "react-select";
import { apiService } from "../services/api";
import { Endpoint } from "../services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface Option {
  label: string;
  value: string;
}

const AddPermissionModal: React.FC<Props> = ({ isOpen, onClose, onSaved }) => {
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [deviceOptions, setDeviceOptions] = useState<Option[]>([]);

  const [selectedUser, setSelectedUser] = useState<Option | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Option[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Option[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchGroups();
    }
  }, [isOpen]);

  // LOAD DEVICES
  useEffect(() => {
    if (selectedGroup.length === 1) {
      fetchDevices(selectedGroup[0].value);
    } else {
      setDeviceOptions([]);
      setSelectedDevice([]);
    }
  }, [selectedGroup]);

  const fetchUsers = async () => {
    const res = await apiService.getRamanAnalysis(Endpoint.KEYCLOAK_USERS, {
      first: 0,
      max: 50,
    });

    if (Array.isArray(res?.data)) {
      setUserOptions(
        res.data.map((u: any) => ({
          label: u.username,
          value: u.id,
        }))
      );
    }
  };

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

  const fetchDevices = async (groupId: string) => {
    const res = await apiService.getRamanAnalysis(Endpoint.GROUP_DEVICES, {
      id: groupId,
    });

    if (res?.data?.devices) {
      setDeviceOptions(
        res.data.devices.map((d: string) => ({
          label: d,
          value: d,
        }))
      );
    }
  };

  // ⭐ Get existing user groups
  const fetchUserExistingAccess = async (userId: string) => {
    const res = await apiService.get(`${Endpoint.ACCESS_MANAGEMENT}/${userId}`);
    return res?.data?.access || [];
  };

  // ⭐⭐⭐ SAVE — MERGE OLD + NEW ⭐⭐⭐
  const handleSave = async () => {
    if (!selectedUser) return alert("Select user");
    if (selectedGroup.length === 0) return alert("Select groups");
    if (selectedDevice.length === 0) return alert("Select devices");

    const userId = selectedUser.value;
    const deviceIds = selectedDevice.map((d) => d.value);

    // 1️⃣ Fetch existing access
    const existingAccess = await fetchUserExistingAccess(userId);

    // 2️⃣ Build new access entries
    const newAccessEntries = selectedGroup.map((group) => ({
      group_id: group.value,
      group_name: group.label,
      devices: deviceIds,
    }));

    // 3️⃣ Merge & remove duplicates
    const mergedAccess = [
      ...existingAccess.filter(
        (old) => !newAccessEntries.some((n) => n.group_id === old.group_id)
      ),
      ...newAccessEntries,
    ];

    // 4️⃣ Send merged payload
    const payload = {
      user_id: userId,
      access: mergedAccess,
    };

    console.log("FINAL MERGED PAYLOAD:", payload);

    await apiService.put(Endpoint.ACCESS_MANAGEMENT_SYNC, payload);

    onSaved?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Permission</h2>

        <label>User</label>
        <Select
          options={userOptions}
          value={selectedUser}
          onChange={(v) => setSelectedUser(v as Option)}
          placeholder="Select User"
          className="mb-4"
        />

        <label>Group</label>
        <Select
          isMulti
          options={groupOptions}
          value={selectedGroup}
          onChange={(v) => setSelectedGroup(v as Option[])}
          placeholder="Select Groups"
          className="mb-4"
        />

        <label>Devices</label>
        <Select
          isMulti
          options={deviceOptions}
          value={selectedDevice}
          onChange={(v) => setSelectedDevice(v as Option[])}
          placeholder={
            selectedGroup.length === 1
              ? "Select Devices"
              : "Choose exactly 1 group to load devices"
          }
          isDisabled={selectedGroup.length !== 1}
          className="mb-4"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPermissionModal;
