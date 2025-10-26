import { useUseCase } from '../contexts/UseCaseContext';
import { useThreatProfile } from '../contexts/ThreatProfileContext';
import { useAttackSurface } from '../contexts/AttackSurfaceContext';
import { useSettings } from '../contexts/SettingsContext';
import { useKnownVulnerabilities } from '../contexts/KnownVulnerabilitiesContext';
import { useKnownIncidents } from '../contexts/KnownIncidentsContext';
import { useIncidentReadiness } from '../contexts/IncidentReadinessContext';
import { useRedTeam } from '../contexts/RedTeamContext';
import { useRedTeamResults } from '../contexts/RedTeamResultsContext';
import { useDefensesMitigations } from '../contexts/DefensesMitigationsContext';
import { useAIThirdPartyQuestions } from '../contexts/AIThirdPartyQuestionsContext';
import { useAIPolicy } from '../contexts/AIPolicyContext';
import { useDataset } from '../contexts/DatasetContext';

// This hook is the core of the MCP (Module Context Protocol) client-side implementation.
// It gathers ALL relevant data from every context provider in the application.
// This complete snapshot of the application's state is then passed to the "MCP Server" (agentic service)
// to give the agent full context for its responses.
export const useAllContexts = () => {
    const useCaseState = useUseCase();
    const threatProfileState = useThreatProfile();
    const attackSurfaceState = useAttackSurface();
    const settingsState = useSettings();
    const knownVulnerabilitiesState = useKnownVulnerabilities();
    const knownIncidentsState = useKnownIncidents();
    const incidentReadinessState = useIncidentReadiness();
    const redTeamState = useRedTeam();
    const redTeamResultsState = useRedTeamResults();
    const defensesMitigationsState = useDefensesMitigations();
    const aiThirdPartyQuestionsState = useAIThirdPartyQuestions();
    const aiPolicyState = useAIPolicy();
    const datasetState = useDataset();

    // This function returns a snapshot of all data, to be called when a message is sent.
    return () => ({
        useCases: useCaseState.useCases,
        threatProfiles: threatProfileState.threatProfiles,
        attackSurface: {
            vectors: attackSurfaceState.attackVectors,
            impactConfig: attackSurfaceState.impactConfig,
            nuclearScenarios: attackSurfaceState.nuclearScenarios
        },
        scoringSettings: settingsState.settings,
        knownVulnerabilities: knownVulnerabilitiesState.vulnerabilities,
        knownIncidents: knownIncidentsState.incidents,
        incidentReadiness: {
            questions: incidentReadinessState.questions,
            categories: incidentReadinessState.incidentCategories,
            monitoringReferences: incidentReadinessState.incidentMonitoringReferences,
        },
        redTeamReview: {
            businessObjective: redTeamState.businessObjective,
            questions: redTeamState.questions
        },
        redTeamResults: {
            results: redTeamResultsState.results,
            mitigationMappings: redTeamResultsState.mitigationMappings,
            strategyRoadmap: redTeamResultsState.strategyRoadmap
        },
        defensesAndMitigations: {
            matrix: defensesMitigationsState.defenses,
            owaspTopTenLLM: defensesMitigationsState.owaspTopTen,
            owaspAgenticTop15: defensesMitigationsState.owaspAgenticTop15,
        },
        aiThirdPartyQuestions: aiThirdPartyQuestionsState.questions,
        aiPolicy: aiPolicyState.policyData,
        attackLibrary: datasetState.promptTemplates,
    });
};
