import { useCallback, useEffect, useState } from 'react';

import {
  createPair,
  createRegistration,
  generateRoundRobin,
  getCategory,
  listMatches,
  listMyPairs,
  listPhases,
  listRankings,
  listRegistrations,
  updateRegistrationStatus,
} from '@/api/categories';
import { getCompetition } from '@/api/competitions';
import type { Category, Competition, Match, Pair, Phase, Ranking, Registration } from '@/api/types';

export function useCategoryDetail(categoryId: number) {
  const [category, setCategory] = useState<Category | null>(null);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [myPairs, setMyPairs] = useState<Pair[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [matchesByPhase, setMatchesByPhase] = useState<Record<number, Match[]>>({});
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const cat = await getCategory(categoryId);
        const [comp, registrationsPage, pairs, phaseList, rankingList] = await Promise.all([
          getCompetition(cat.competition_id),
          listRegistrations(categoryId),
          listMyPairs(),
          listPhases(categoryId),
          listRankings(categoryId),
        ]);

        const matches: Record<number, Match[]> = {};
        if (phaseList.length > 0) {
          const matchPages = await Promise.all(phaseList.map((phase) => listMatches(phase.id)));
          phaseList.forEach((phase, index) => {
            matches[phase.id] = matchPages[index].data;
          });
        }

        setCategory(cat);
        setCompetition(comp);
        setRegistrations(registrationsPage.data);
        setMyPairs(pairs);
        setPhases(phaseList);
        setMatchesByPhase(matches);
        setRankings(rankingList);
      } catch {
        setError('No se pudo cargar la categoría.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [categoryId, reloadKey]);

  const runMutation = useCallback(
    async (action: () => Promise<unknown>, failureMessage: string) => {
      setIsMutating(true);
      setError(null);
      try {
        await action();
        refetch();
      } catch {
        setError(failureMessage);
      } finally {
        setIsMutating(false);
      }
    },
    [refetch]
  );

  const confirmRegistration = useCallback(
    (registrationId: number) =>
      runMutation(
        () => updateRegistrationStatus(registrationId, 'confirmed'),
        'No se pudo confirmar la inscripción.'
      ),
    [runMutation]
  );

  const rejectRegistration = useCallback(
    (registrationId: number) =>
      runMutation(
        () => updateRegistrationStatus(registrationId, 'rejected'),
        'No se pudo rechazar la inscripción.'
      ),
    [runMutation]
  );

  const joinWithPair = useCallback(
    (pairId: number) =>
      runMutation(
        () => createRegistration(categoryId, { pair_id: pairId }),
        'No se pudo completar la inscripción.'
      ),
    [runMutation, categoryId]
  );

  const formPairAndJoin = useCallback(
    (partnerId: number, name?: string) =>
      runMutation(async () => {
        const pair = await createPair(partnerId, name);
        await createRegistration(categoryId, { pair_id: pair.id });
      }, 'No se pudo formar la pareja e inscribirte.'),
    [runMutation, categoryId]
  );

  const generateCalendar = useCallback(
    () =>
      runMutation(
        () => generateRoundRobin(categoryId),
        'No se pudo generar el calendario (¿hay al menos 2 parejas confirmadas?).'
      ),
    [runMutation, categoryId]
  );

  return {
    category,
    competition,
    registrations,
    myPairs,
    phases,
    matchesByPhase,
    rankings,
    isLoading,
    isMutating,
    error,
    refetch,
    confirmRegistration,
    rejectRegistration,
    joinWithPair,
    formPairAndJoin,
    generateCalendar,
  };
}
