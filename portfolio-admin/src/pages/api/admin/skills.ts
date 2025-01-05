// Dans la route POST pour mettre à jour une compétence
if (req.method === 'POST') {
  try {
    const { name, level, category, isHidden } = req.body;
    const skill = await Skill.findByIdAndUpdate(
      req.query.id,
      { 
        name, 
        level, 
        category,
        isHidden
      },
      { new: true }
    );
    return res.status(200).json(skill);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update skill' });
  }
} 