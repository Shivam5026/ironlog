import { useSearchExercises } from '../hooks/useSearchExercises'
import {ErrorState} from '../../../shared/components/ui/ErrorState'
import { Spinner } from '@/shared/components/common/Spinner';

function Testing() {
    const { data, isLoading, error } = useSearchExercises({
  search: "bench",
});

if (isLoading) return <Spinner />;

if (error) return <ErrorState title='no exercises found' />;

console.log(data);
  return (
    <div>Testing</div>
  )
}

export default Testing