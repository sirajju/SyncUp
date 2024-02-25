import { useState } from "react"
import ListBox from "../ListBox/ListBox"
import { NotesTableData } from '../Notes/Notes'
import { UsersTableData } from "../Users/Users"

export default function ({ type, data,activeTab,setViewData }) {
    const [prog, setProg] = useState(false)

    const headings = {
        users: ['Username', 'Email','Notes', 'Premium', 'Verified', 'Points', 'Business', 'Block/Unblock', 'Actions'],
        notes: ['Email', 'Content', 'Likes', 'Created', 'Expired', 'Time', 'Visibility', 'Actions'],
    }
    let tableData = {
        users: UsersTableData,
        notes: NotesTableData
    }
    const Component = tableData[type]

    return (
        <ListBox backButton={true} backButtonFunction={setViewData} active={activeTab} prog={prog} th={headings[type]} >
            <Component mainData={data} prog={prog} setProg={setProg} />
        </ListBox>
    )
}
