import { Table} from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

const InfoList =() =>{


    const data =[{
        "id": 2141251251,
        "name": "Mae Hansen",
        "firstName": "Mae",
        "lastName": "Hansen",
        "avatar": "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/484.jpg",
        "city": "Wisozkburgh",
        "street": "Bahringer Course",
        "postcode": "11798",
        "email": "Larry_DAmore@hotmail.com",
        "phone": "337.773.1918 x84180",
        "gender": "male",
        "age": 28,
        "stars": 1450,
        "followers": 5274,
        "rating": 3,
        "progress": 33,
        "amount": "43701.84",
        "company": "O'Connell - Abshire"
      }]
      const renderStatusCell = (rowData, rowIndex) => {
        return (
          <Cell>
            <button className="statusButton">状态按钮</button>
          </Cell>
        );
      };
    
    return (
        <div className="infoBox">
        <Table height={81} data={data} headerHeight={35}>
            <Column width={150} align="center" fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>ID</HeaderCell>
              <Cell dataKey="id" />
            </Column>
            <Column width={150} fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>Type</HeaderCell>
              <Cell dataKey="name" ></Cell>
            </Column>
            <Column width={170} fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>startTime</HeaderCell>
              <Cell dataKey="street" ></Cell>
            </Column>
            <Column width={170} fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>endTime</HeaderCell>
              <Cell dataKey="amount" ></Cell>
            </Column>
            <Column width={150} fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>状态追踪</HeaderCell>
              <Cell>{renderStatusCell}</Cell>
            </Column>
          </Table>
        </div>
    )
}

export default InfoList;