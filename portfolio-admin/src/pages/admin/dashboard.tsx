import { GetServerSideProps } from 'next';

/**
 * Fusion Phase 2 : le tableau de bord unique a été consolidé dans le
 * Control Center (`/admin`). Cette route préserve l'ancien chemin en
 * redirigeant vers le dashboard unifié.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/admin',
      permanent: false,
    },
  };
};

export default function DashboardRedirect() {
  return null;
}
