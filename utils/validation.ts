// Utilitaires de validation pour les idées
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateIdeaTitle = (title: string): ValidationResult => {
  const errors: string[] = [];
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    errors.push('Le titre est requis');
  } else if (trimmedTitle.length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères');
  } else if (trimmedTitle.length > 100) {
    errors.push('Le titre ne peut pas dépasser 100 caractères');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBrainDump = (brainDump: string): ValidationResult => {
  const errors: string[] = [];
  const trimmedBrainDump = brainDump.trim();

  if (!trimmedBrainDump) {
    errors.push('Le brain dump est requis');
  } else if (trimmedBrainDump.length < 50) {
    errors.push('Le brain dump doit contenir au moins 50 caractères pour une analyse pertinente');
  } else if (trimmedBrainDump.length > 10000) {
    errors.push('Le brain dump ne peut pas dépasser 10 000 caractères');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateIdea = (idea: { title?: string; brainDump?: string }): ValidationResult => {
  const errors: string[] = [];

  if (idea.title !== undefined) {
    const titleValidation = validateIdeaTitle(idea.title);
    if (!titleValidation.isValid) {
      errors.push(...titleValidation.errors);
    }
  }

  if (idea.brainDump !== undefined) {
    const brainDumpValidation = validateBrainDump(idea.brainDump);
    if (!brainDumpValidation.isValid) {
      errors.push(...brainDumpValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};


