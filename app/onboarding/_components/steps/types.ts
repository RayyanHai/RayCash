export interface StepProps {
  onNext: (answers: Record<string, unknown>) => void;
  onBack: () => void;
  onSkip: () => void;
  saving: boolean;
  isFirst: boolean;
  isLast: boolean;
}
