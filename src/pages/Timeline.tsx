import { useParams } from 'react-router-dom';
import { TimelineContainer } from '@/components/timeline/TimelineContainer';

const Timeline = () => {
  const { domain } = useParams<{ domain: string }>();
  
  return <TimelineContainer domain={domain || 'example.com'} />;
};

export default Timeline;
