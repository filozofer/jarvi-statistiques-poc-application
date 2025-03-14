import { useEffect, useState} from 'react';
import { gql } from '@apollo/client';
import { useSignInEmailPassword } from '@nhost/react';
import { useAuthQuery } from '@nhost/react-apollo';
import { AppBar, Toolbar, Container, Box, Card, CardContent, Typography, Stack, MenuItem, Select, FormGroup, FormControlLabel, Switch, InputLabel } from '@mui/material';
import { useFormik } from 'formik';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const HISTORY_ENTRIES_STATISTIQUES_QUERY = gql`
    query MyQuery($userId: uuid!, $createdAtGte: timestamptz!, $createdAtLt: timestamptz!) {
      email_solicitation_success: historyentries_aggregate(where: {deletedAt: {_is_null: true}, triggerHasBeenRepliedTo: {_is_null: false, _eq: true}, userId: {_eq: $userId }, createdAt: {_gte: $createdAtGte, _lt: $createdAtLt}, type: {_eq: "EMAIL_SENT"}}) {
        aggregate {
          count
        }
      }
      email_solicitation_failed: historyentries_aggregate(where: {deletedAt: {_is_null: true}, triggerHasBeenRepliedTo: {_is_null: false, _eq: false}, userId: {_eq: $userId }, createdAt: {_gte: $createdAtGte, _lt: $createdAtLt}, type: {_eq: "EMAIL_SENT"}}) {
        aggregate {
          count
        }
      }
      linkedin_message_solicitation_success: historyentries_aggregate(where: {deletedAt: {_is_null: true}, triggerHasBeenRepliedTo: {_is_null: false, _eq: true}, userId: {_eq: $userId }, createdAt: {_gte: $createdAtGte, _lt: $createdAtLt}, type: {_eq: "LINKEDIN_MESSAGE_SENT"}}) {
        aggregate {
          count
        }
      }
      linkedin_message_solicitation_failed: historyentries_aggregate(where: {deletedAt: {_is_null: true}, triggerHasBeenRepliedTo: {_is_null: false, _eq: false}, userId: {_eq: $userId }, createdAt: {_gte: $createdAtGte, _lt: $createdAtLt}, type: {_eq: "LINKEDIN_MESSAGE_SENT"}}) {
        aggregate {
          count
        }
      }
      linkedin_inmail_solicitation_success: historyentries_aggregate(where: {deletedAt: {_is_null: true}, triggerHasBeenRepliedTo: {_is_null: false, _eq: true}, userId: {_eq: $userId }, createdAt: {_gte: $createdAtGte, _lt: $createdAtLt}, type: {_eq: "LINKEDIN_INMAIL_SENT"}}) {
        aggregate {
          count
        }
      }
      linkedin_inmail_solicitation_failed: historyentries_aggregate(where: {deletedAt: {_is_null: true}, triggerHasBeenRepliedTo: {_is_null: false, _eq: false}, userId: {_eq: $userId }, createdAt: {_gte: $createdAtGte, _lt: $createdAtLt}, type: {_eq: "LINKEDIN_INMAIL_SENT"}}) {
        aggregate {
          count
        }
      }
    }
`

interface FiltersState {
    user: string;
    period: string;
    periodCompare: string;
}

interface FiltersProps {
    filters: FiltersState;
    setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
}

/**
 * Filters component.
 */
const Filters = ({ filters, setFilters }: FiltersProps) => {

    // Init filters form
    const formik = useFormik({
        initialValues: filters,
        onSubmit: (values) => setFilters(values),
    });
    const submitOnHandleChange = (e: any) => {
        formik.handleChange(e);
        formik.handleSubmit();
    }

    // Render filters form
    return (
        <form onSubmit={formik.handleSubmit}>
            <Box style={{ display: 'flex'}}>

                {/* Fake user selection for POC */}
                <Box sx={{ marginRight: '10px' }}>
                    <InputLabel htmlFor="user">Utilisateur</InputLabel>
                    <Select name="user" value={formik.values.user} onChange={submitOnHandleChange} fullWidth margin="dense">
                        <MenuItem value="32ca93da-0cf6-4608-91e7-bc6a2dbedcd1">Tous les membres de l'équipe</MenuItem>
                        <MenuItem value="32ca93da-0cf6-4608-91e7-bc6a2dbedcd1">Quentin Decré</MenuItem>
                    </Select>
                </Box>

                {/* Period selection */}
                <Box sx={{ marginRight: '10px' }}>
                    <InputLabel htmlFor="period">Période</InputLabel>
                    <Select name="period" value={formik.values.period} onChange={submitOnHandleChange} fullWidth margin="dense">
                        <MenuItem value="current_week">Semaine en cours</MenuItem>
                        <MenuItem value="current_month">Mois en cours</MenuItem>
                        <MenuItem value="last_week">Semaine précédente</MenuItem>
                        <MenuItem value="last_month">Mois précédent</MenuItem>
                    </Select>
                </Box>

                {/* Period de comparaison */}
                <Box sx={{ marginRight: '10px' }}>
                    <InputLabel htmlFor="periodCompare">Période de comparaison</InputLabel>
                    <Select name="periodCompare" value={formik.values.periodCompare} onChange={submitOnHandleChange} fullWidth margin="dense">
                        <MenuItem value="none">Choisir une période de comparaison...</MenuItem>
                        <MenuItem value="current_week">Semaine en cours</MenuItem>
                        <MenuItem value="current_month">Mois en cours</MenuItem>
                        <MenuItem value="last_week">Semaine précédente</MenuItem>
                        <MenuItem value="last_month">Mois précédent</MenuItem>
                    </Select>
                </Box>

            </Box>
        </form>
    );
};

/**
 * Convert form filters to GraphQL API variables.
 */
const filtersToQueryVariables = (filters: FiltersState, periodProperty: 'period'|'periodCompare')=> {

    // Init query variables base on filters
    let variables = {
        userId: filters.user,
        createdAtGte: '',
        createdAtLt: ''
    };

    // Adapt period
    switch (filters[periodProperty]) {
        case 'current_week':
            variables = {
                ...variables,
                createdAtGte: moment().startOf('week').format('YYYY-MM-DD'),
                createdAtLt: moment().startOf('week').add(1, 'week').format('YYYY-MM-DD')
            };
            break;
        case 'current_month':
            variables = {
                ...variables,
                createdAtGte: moment().startOf('month').format('YYYY-MM-DD'),
                createdAtLt: moment().startOf('month').add(1, 'month').format('YYYY-MM-DD')
            };
            break;
        case 'last_week':
            variables = {
                ...variables,
                createdAtGte: moment().startOf('week').subtract(1, 'week').format('YYYY-MM-DD'),
                createdAtLt: moment().startOf('week').format('YYYY-MM-DD')
            };
            break;
        case 'last_month':
            variables = {
                ...variables,
                createdAtGte: moment().startOf('month').subtract(1, 'month').format('YYYY-MM-DD'),
                createdAtLt: moment().startOf('month').format('YYYY-MM-DD')
            };
            break;
    }

    return variables;
}

/**
 * StatsCharts component.
 */
const StatsCharts = ({ filters }: FiltersProps) => {

    // Init State
    const [showPieChartAsPercentage, setShowPieChartAsPercentage] = useState<boolean>(false);
    const [historyEntriesStatistiquesQueryVariables, setHistoryEntriesStatistiquesQueryVariables] = useState(filtersToQueryVariables(filters, 'period'));
    const [historyEntriesCompareStatistiquesQueryVariables, setHistoryEntriesCompareStatistiquesQueryVariables] = useState(filtersToQueryVariables(filters, 'periodCompare'));

    // Trigger API call again when a filter change
    useEffect(() => {
        // Build GraphQL API variables from filters
        setHistoryEntriesStatistiquesQueryVariables(filtersToQueryVariables(filters, 'period'));
        setHistoryEntriesCompareStatistiquesQueryVariables(filtersToQueryVariables(filters, 'periodCompare'));
    }, [filters])

    // Retrieve statistics with Hasura GraphQL aggregations
    // ⚠️ More than 20 seconds for retrieving the numbers. Maybe it's time to using an ElasticSearch or indexes on database ?
    const { data, loading, error } = useAuthQuery(HISTORY_ENTRIES_STATISTIQUES_QUERY, { variables: historyEntriesStatistiquesQueryVariables });
    const { data: dataCompare, loading: loadingCompare, error: errorCompare } = useAuthQuery(HISTORY_ENTRIES_STATISTIQUES_QUERY, { variables: historyEntriesCompareStatistiquesQueryVariables, skip: filters.periodCompare === 'none' });
    // Pre-render loading or error state
    if (loading || loadingCompare|| !data) return <p>Chargement en cours de vos statistiques...</p>;
    if (error) return <p>Une erreur est survenue lors de la récupération de vos statistiques</p>;

    // Format charts data from API Response
    const chartDataType = [
        { name: 'Sollicitations Emails',  color: '#040A33', value: data.email_solicitation_success.aggregate.count + data.email_solicitation_failed.aggregate.count },
        { name: 'Sollicitations LinkedIn', color: '#0A66C2', value: data.linkedin_message_solicitation_success.aggregate.count + data.linkedin_message_solicitation_failed.aggregate.count + data.linkedin_inmail_solicitation_success.aggregate.count + data.linkedin_inmail_solicitation_failed.aggregate.count },
    ];
    const chartDataDetails = [
        { name: 'Emails réussis', color: '#040A33', value: data.email_solicitation_success.aggregate.count },
        { name: 'Emails échoués', color: '#6275F4', value: data.email_solicitation_failed.aggregate.count },
        { name: 'LinkedIn messages réussis', color: '#0A66C2', value: data.linkedin_message_solicitation_success.aggregate.count },
        { name: 'LinkedIn messages échoués', color: '#86BFF9', value: data.linkedin_message_solicitation_failed.aggregate.count },
        { name: 'LinkedIn inmail réussis', color: '#E6AE2F', value: data.linkedin_inmail_solicitation_success.aggregate.count },
        { name: 'LinkedIn inmail échoués', color: '#EDC568', value: data.linkedin_inmail_solicitation_failed.aggregate.count },
    ];
    // Same data but as percentage
    const chartDataDetailsPercentage = [
        { name: 'Emails réussis', color: '#040A33', value: +(chartDataDetails[0].value * 100 / (chartDataDetails[0].value + chartDataDetails[1].value)).toFixed(0) },
        { name: 'Emails échoués', color: '#6275F4', value: +(chartDataDetails[1].value * 100 / (chartDataDetails[0].value + chartDataDetails[1].value)).toFixed(0) },
        { name: 'LinkedIn messages réussis', color: '#0A66C2', value: +(chartDataDetails[2].value * 100 / (chartDataDetails[2].value + chartDataDetails[3].value)).toFixed(0) },
        { name: 'LinkedIn messages échoués', color: '#86BFF9', value: +(chartDataDetails[3].value * 100 / (chartDataDetails[2].value + chartDataDetails[3].value)).toFixed(0) },
        { name: 'LinkedIn inmail réussis', color: '#E6AE2F', value: +(chartDataDetails[4].value * 100 / (chartDataDetails[4].value + chartDataDetails[5].value)).toFixed(0) },
        { name: 'LinkedIn inmail échoués', color: '#EDC568', value: +(chartDataDetails[5].value * 100 / (chartDataDetails[4].value + chartDataDetails[5].value)).toFixed(0) },
    ];

    // TODO [1] Charts for period comparaison
    // TODO [1] optimization API response time
    // TODO [2] tests?
    // TODO [<1] comment everywhere
    // TODO [<1] Commit + Push on github
    // TODO [<1] Upload on netifly
    // TODO [<1] Send my result to Quentin
    console.log('Data', data);
    console.log('DataCompare', dataCompare);

    // Render charts
    return (
        <>
            <Box
                marginBottom={"40px"}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
            >
                <strong style={{ paddingLeft: "10%", fontSize: "20px" }}>Taux de réponse aux sollications des candidats</strong>
                <ResponsiveContainer width="100%" height={600}>
                    <PieChart width={400} height={400}>
                        <Pie data={chartDataType} dataKey="value" cx="50%" cy="50%" outerRadius={60}>
                            {chartDataType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Pie
                            data={chartDataDetails} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={90}
                            label={({index}) => {
                                return showPieChartAsPercentage ? chartDataDetailsPercentage[index]?.value : chartDataDetails[index]?.value;
                            }}
                        >
                            {chartDataDetails.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                        />
                    </PieChart>
                </ResponsiveContainer>
                <FormGroup row>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showPieChartAsPercentage}
                                onChange={(event) => setShowPieChartAsPercentage(event.target.checked)}
                                name="showPieChartAsPercentage"
                                color="primary"
                            />
                        }
                        label={showPieChartAsPercentage ? 'Afficher en volume' : 'Afficher en pourcentage'}
                    />
                </FormGroup>
            </Box>
        </>
    );
};

/**
 * Main page component.
 */
export default function Home() {

    // Basic user authentication for this POC
    const { signInEmailPassword } = useSignInEmailPassword()
    useEffect(() => {
        signInEmailPassword('quentin@jarvi.tech', 'mYAW9QVdMKZenfbA')
    }, []);

    // Dashboard filters fields
    const [filters, setFilters] = useState<FiltersState>({
        user: '32ca93da-0cf6-4608-91e7-bc6a2dbedcd1',
        period: 'current_month',
        periodCompare: 'none'
    });

    // Render
    return (
        <Container>

            {/* Header bar */}
            <AppBar position="static">
                <Toolbar>

                    {/* Titre */}
                    <Typography variant="h6" sx={{ color: 'white', flexGrow: 1 }}>
                        Jarvi Statistiques Filozofer POC
                    </Typography>

                </Toolbar>
            </AppBar>

            {/* Main page Container */}
            <Stack spacing={2}>

                {/* Filters form */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Filtres</Typography>
                        <Filters filters={filters} setFilters={setFilters} />
                    </CardContent>
                </Card>

                {/* Graphs */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Statistiques</Typography>
                        <StatsCharts filters={filters} setFilters={setFilters} />
                    </CardContent>
                </Card>
            </Stack>

        </Container>
    )
}