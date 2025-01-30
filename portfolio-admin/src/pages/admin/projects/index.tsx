import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import Head from 'next/head';
import { FiPlus } from 'react-icons/fi';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/Layout';
import DataTable from '@/components/admin/DataTable';
import DeleteConfirmation from '@/components/admin/DeleteConfirmation';
import ProjectForm from '@/components/admin/projects/ProjectForm';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

interface ProjectsPageProps {
  initialProjects: any[];
}

export default function ProjectsPage({ initialProjects }: ProjectsPageProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value: string, project: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {project.description.substring(0, 100)}...
          </div>
        </div>
      ),
    },
    {
      key: 'technologies',
      label: 'Technologies',
      render: (technologies: string[] = []) => (
        <div className="flex flex-wrap gap-1">
          {technologies?.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
            >
              {tech}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormModalOpen(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects((prev) =>
        prev.filter((project) => project._id !== projectToDelete._id)
      );
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingProject) {
        // Update existing project
        const response = await fetch(`/api/projects/${editingProject._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update project');
        }

        const updatedProject = await response.json();
        setProjects((prev) =>
          prev.map((p) => (p._id === editingProject._id ? updatedProject : p))
        );
      } else {
        // Create new project
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create project');
        }

        const newProject = await response.json();
        setProjects((prev) => [newProject, ...prev]);
      }

      setFormModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manage Projects - Admin Dashboard</title>
      </Head>

      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Projects
          </h1>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => {
              setEditingProject(null);
              setFormModalOpen(true);
            }}
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Project
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <DataTable
            columns={columns}
            data={projects}
            onEdit={handleEdit}
            onDelete={(project) => {
              setProjectToDelete(project);
              setDeleteModalOpen(true);
            }}
          />
        </div>
      </div>

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone.`}
      />

      <ProjectForm
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingProject}
        title={editingProject ? 'Edit Project' : 'Add Project'}
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

  const projects = await Project.find({}).lean();

  return {
    props: {
      initialProjects: JSON.parse(JSON.stringify(projects)),
    },
  };
};
