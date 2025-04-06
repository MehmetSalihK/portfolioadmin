interface SkillsSectionProps {
  skillsByCategory: {
    _id: string;
    name: string;
    displayOrder: number;
    skills: {
      _id: string;
      name: string;
      categoryId: {
        name: string;
        _id: string;
      };
      displayOrder: number;
    }[];
  }[];
}

const SkillsSection = ({ skillsByCategory }: SkillsSectionProps) => {
// ... existing code ...
} 