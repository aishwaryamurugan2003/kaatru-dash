import React, { useEffect, useState } from "react";
import Select from "react-select";
import { apiService } from "../services/api";
import { Endpoint } from "../services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Option {
  label: string;
  value: string;
}

const AddPermissionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [deviceOptions, setDeviceOptions] = useState<Option[]>([]);

  const [selectedUser, setSelectedUser] = useState<Option | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Option | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Option | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedGroup) {
      fetchDevices(selectedGroup.value);
    } else {
      setDeviceOptions([]);
      setSelectedDevice(null);
    }
  }, [selectedGroup]);

  // -------- USERS --------
  const fetchUsers = async () => {
    try {
      const res = await apiService.getRamanAnalysis(Endpoint.KEYCLOAK_USERS, {
        first: 0,
        max: 50,
      });

      console.log("Users API:", res?.data);

      if (Array.isArray(res?.data)) {
        setUserOptions(
          res.data.map((u: any) => ({
            label: u.username,
            value: u.id,
          }))
        );
      }
    } catch (e) {
      console.log("Users API ERROR:", e);
    }
  };

  // -------- GROUPS --------
  const fetchGroups = async () => {
    try {
      const res = await apiService.getRamanAnalysis(Endpoint.GROUP_ALL);

      console.log("Groups API:", res?.data);

      if (Array.isArray(res?.data)) {
        setGroupOptions(
          res.data.map((g: any) => ({
            label: g.name,
            value: g.id,
          }))
        );
      }
    } catch (e) {
      console.log("Groups API ERROR:", e);
    }
  };

  // -------- DEVICES --------
  const fetchDevices = async (groupId: string) => {
    try {
      const res = await apiService.getRamanAnalysis(Endpoint.GROUP_DEVICES, {
        id: groupId,
      });

      console.log("Devices API:", res?.data);

      if (res?.data?.devices) {
        setDeviceOptions(
          res.data.devices.map((d: string) => ({
            label: d,
            value: d,
          }))
        );
      }
    } catch (e) {
      console.log("Devices API ERROR:", e);
      setDeviceOptions([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Permission</h2>

        {/* USER */}
        <label className="font-medium">User</label>
        <Select
          options={userOptions}
          value={selectedUser}
          onChange={setSelectedUser}
          placeholder="Select User"
          className="mb-4"
        />

        {/* GROUP */}
        <label className="font-medium">Group</label>
        <Select
          options={groupOptions}
          value={selectedGroup}
          onChange={setSelectedGroup}
          placeholder="Select Group"
          className="mb-4"
        />

        {/* DEVICE */}
        <label className="font-medium">Device</label>
        <Select
          options={deviceOptions}
          value={selectedDevice}
          onChange={setSelectedDevice}
          placeholder={
            selectedGroup ? "Select Device" : "Select a group first"
          }
          isDisabled={!selectedGroup}
          className="mb-4"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPermissionModal;
