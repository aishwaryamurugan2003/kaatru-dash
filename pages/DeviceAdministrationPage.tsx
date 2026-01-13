import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { apiService } from "../services/api";
import { Endpoint } from "../services/api";
import AddPermissionModal from "../components/AddPermissionModal";

const DeviceAdministrationPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ------------------------------------------------------------
     FETCH ACCESS MANAGEMENT USERS
  ------------------------------------------------------------ */
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await apiService.get(Endpoint.ACCESS_MANAGEMENT);

      console.log("ACCESS MGMT API:", res?.data);

      const data = res?.data;

      if (Array.isArray(data)) {
        const normalized = data.map((u, index) => ({
          key: u.user_id,
          sno: index + 1,
          username: u.username,
          email: u.email,
          groups: u.groups?.length ? u.groups.join(", ") : "—",
          access: u.access,
        }));

        setUsers(normalized);
      } else {
        setUsers([]);
      }

    } catch (error) {
      console.log("ACCESS MGMT ERROR:", error);
      setUsers([]);
    }
  };

  fetchUsers();
}, []);

  /* ------------------------------------------------------------
     TABLE COLUMNS
  ------------------------------------------------------------ */
  const columns = [
    {
      title: "S.No",
      dataIndex: "sno",
      key: "sno",
      width: 80,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Groups",
      dataIndex: "groups",
      key: "groups",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div className="flex gap-4 text-lg cursor-pointer">
          <EditOutlined className="text-blue-600 hover:text-blue-800" />
          <DeleteOutlined className="text-red-600 hover:text-red-800" />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Device Management</h1>

      {/* Search + Add Permission */}
      <div className="flex justify-between mb-6">
        <input
          placeholder="Search..."
          className="border px-4 py-2 rounded-lg w-1/3"
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Add Permission
        </button>
      </div>

      {/* USER TABLE */}
      <div className="bg-white shadow rounded-lg p-4">
        <Table
          columns={columns}
          dataSource={users}
          pagination={{ pageSize: 10 }}
        />

        {users.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No users found.
          </p>
        )}
      </div>

      {/* MODAL */}
      <AddPermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DeviceAdministrationPage;
