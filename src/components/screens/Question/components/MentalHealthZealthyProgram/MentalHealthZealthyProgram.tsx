import ZealthyLogo from '@/components/shared/icons/ZealthyLogo';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Logo from '@/components/shared/icons/Logo';

const TableHeaders = () => {
  return (
    <>
      <Grid item xs={6} borderBottom="1px solid #AFAFAF" padding="25px">
        <Typography>{'Other mental health programs'}</Typography>
      </Grid>
      <Grid
        item
        xs={6}
        borderBottom="1px solid #AFAFAF"
        bgcolor="#B8F5CC"
        padding="25px"
      >
        <Logo />
      </Grid>
    </>
  );
};

type TableDataType = {
  id: number;
  column1: string;
  column2: string;
};

const tableData: TableDataType[] = [
  {
    id: 1,
    column1: 'Unable to message or reach coach outside sessions',
    column2: 'Unlimited messaging with coach in Zealthy portal',
  },
  {
    id: 2,
    column1: 'Brief sessions that don’t allow getting to root causes',
    column2: '45 minute sessions with coaches who dive deep',
  },
  {
    id: 3,
    column1: 'No matching to coaches who will be a good fit',
    column2:
      'Matching algorithm to identify best coach for you & ability to request changes for new coach',
  },
];

interface TableBodyProps {
  data: TableDataType[];
}

interface TableRowProps {
  row: TableDataType;
}

const TableRow = ({ row }: TableRowProps) => {
  return (
    <>
      <Grid item xs={6} borderBottom="1px solid #AFAFAF" padding="25px">
        <Typography fontWeight={300} variant="caption">
          {row.column1}
        </Typography>
      </Grid>
      <Grid
        item
        xs={6}
        borderBottom="1px solid #AFAFAF"
        bgcolor="#B8F5CC"
        padding="25px"
      >
        <Typography>{row.column2}</Typography>
      </Grid>
    </>
  );
};

const TableBody = ({ data }: TableBodyProps) => {
  return (
    <>
      {data.map(item => (
        <TableRow key={item.id} row={item} />
      ))}
    </>
  );
};

const MentalHealthZealthyProgram = () => {
  return (
    <Grid container>
      <TableHeaders />
      <TableBody data={tableData} />
    </Grid>
  );
};

export default MentalHealthZealthyProgram;
