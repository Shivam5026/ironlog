import { useState } from "react";

import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";

import { useDebounce } from "../hooks/useDebounce";
import { useSearchExercises } from "../hooks/useSearchExercises";

export default function ExerciseLibrary() {
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
  } = useSearchExercises({
    search: debouncedSearch,
  });

  const normalizedSearch = debouncedSearch.trim();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <div>
        <h1 className="text-4xl font-bold">
          Exercise Library
        </h1>

        <p className="mt-2 text-slate-400">
          Search thousands of exercises by name.
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
      />

      {normalizedSearch.length > 0 &&
        normalizedSearch.length < 2 && (
          <p className="text-sm text-slate-400">
            Type at least 2 characters to search.
          </p>
        )}

      {isFetching && !isPending && (
        <div className="text-sm text-slate-400">
          Updating results...
        </div>
      )}

      {normalizedSearch.length >= 2 ? (
        <SearchResults
          exercises={data?.data ?? []}
          isPending={isPending}
          isError={isError}
          error={error}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700 py-16 text-center text-slate-500">
          Start typing to search exercises.
        </div>
      )}
    </div>
  );
}