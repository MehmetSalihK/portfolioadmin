import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import Head from 'next/head';
import { FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/Layout';
import DataTable from '@/components/admin/DataTable';
import DeleteConfirmation from '@/components/admin/DeleteConfirmation';
import ExperienceForm from '@/components/admin/experiences/ExperienceForm';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';

interface ExperiencesPageProps {
  initialExperiences: any[];
}

export default function ExperiencesPage({
  initialExperiences,
}: ExperiencesPageProps) {
  const [experiences, setExperiences] = useState(initialExperiences);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<any>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);

  const columns = [
    {
      key: 'title',
      label: 'Job Title',
    },
    {
      key: 'company',
      label: 'Company',
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <span className="capitalize">{value.replace('-', ' ')}</span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
    },
    {
      key: 'date',
      label: 'Duration',
      render: (_: any, experience: any) => {
        const startDate = format(new Date(experience.startDate), 'MMM yyyy');
        const endDate = experience.current
          ? 'Present'
          : format(new Date(experience.endDate), 'MMM yyyy');
        return `${startDate} - ${endDate}`;
      },
    },
  ];

  const handleEdit = (experience: any) => {
    setEditingExperience(experience);
    setFormModalOpen(true);
  };

  const handleDelete = async () => {
    if (!experienceToDelete) return;

    try {
      const response = await fetch(`/api/experiences/${experienceToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete experience');
      }

      setExperiences((prev) =>
        prev.filter((exp) => exp._id !== experienceToDelete._id)
      );
      setDeleteModalOpen(false);
      setExperienceToDelete(null);
    } catch (error) {
      console.error('Error deleting experience:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingExperience) {
        // Update existing experience
        const response = await fetch(
          `/api/experiences/${editingExperience._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update experience');
        }

        const updatedExperience = await response.json();
        setExperiences((prev) =>
          prev.map((e) =>
            e._id === editingExperience._id ? updatedExperience : e
          )
        );
      } else {
        // Create new experience
        const response = await fetch('/api/experiences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create experience');
        }

        const newExperience = await response.json();
        setExperiences((prev) => [...prev, newExperience]);
      }

      setFormModalOpen(false);
      setEditingExperience(null);
    } catch (error) {
      console.error('Error saving experience:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manage Experience - Admin Dashboard</title>
      </Head>

      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Professional Experience
          </h1>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => {
              setEditingExperience(null);
              setFormModalOpen(true);
            }}
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Experience
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <DataTable
            columns={columns}
            data={experiences}
            onEdit={handleEdit}
            onDelete={(experience) => {
              setExperienceToDelete(experience);
              setDeleteModalOpen(true);
            }}
          />
        </div>
      </div>

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setExperienceToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Experience"
        message={`Are you sure you want to delete the experience at "${experienceToDelete?.company}"? This action cannot be undone.`}
      />

      <ExperienceForm
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingExperience(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingExperience}
        title={editingExperience ? 'Edit Experience' : 'Add Experience'}
      />
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  await connectDB();

  const experiences = await Experience.find({})
    .sort({ startDate: -1 })
    .lean();

  return {
    props: {
      initialExperiences: JSON.parse(JSON.stringify(experiences)),
    },
  };
};
