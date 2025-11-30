import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PhaseContainer } from '../PhaseContainer';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CSATPhaseProps {
  onSubmit: (rating: number, feedback?: string) => void;
  onNext: () => void;
}

export const CSATPhase: React.FC<CSATPhaseProps> = ({ onSubmit, onNext }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      onSubmit(rating, feedback.trim() || undefined);
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onNext();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <PhaseContainer
      currentPhase={3}
      totalPhases={4}
      title="Rate Your Experience"
      subtitle="Help us improve Tag Max onboarding"
    >
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="text-4xl mb-4">⭐</div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              Rate your onboarding experience with Tag Max
            </p>
            <p className="text-sm text-muted-foreground">
              1 = Poor, 5 = Excellent
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-2 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  (hoveredRating >= star || rating >= star)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>

        {(rating > 0 || hoveredRating > 0) && (
          <div className="text-center">
            <p className="text-lg font-medium text-primary">
              {getRatingText(hoveredRating || rating)}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label 
            htmlFor="feedback" 
            className="text-sm font-medium text-foreground"
          >
            What worked well or could be improved? (Optional)
          </label>
          <Textarea
            id="feedback"
            placeholder="Share your thoughts..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {feedback.length}/500 characters
          </p>
        </div>

        <div className="flex-1 flex items-end">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full"
            variant="success"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </div>
    </PhaseContainer>
  );
};