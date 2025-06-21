import SkillCard from './SkillCard';

interface Skill {
  _id: string;
  name: string;
  icon: string;
  level: number;
}

interface SkillCategoryProps {
  category: string;
  skills: Skill[];
}

const SkillCategory = ({ category, skills }: SkillCategoryProps) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {category}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <SkillCard key={skill._id} skill={skill} />
        ))}
      </div>
    </div>
  );
};

export default SkillCategory;
