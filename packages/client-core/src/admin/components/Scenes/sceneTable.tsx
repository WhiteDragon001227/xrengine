import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { Dispatch, bindActionCreators } from 'redux'
import { useSceneStyles, useSceneStyle } from './styles'
import { sceneColumns, SceneData } from './variables'
import TablePagination from '@material-ui/core/TablePagination'
import { fetchAdminScenes, deleteScene } from '../../reducers/admin/scene/service'
import { connect } from 'react-redux'
import { useAuthState } from '../../../user/reducers/auth/AuthState'
import { selectAdminSceneState } from '../../reducers/admin/scene/selector'
import ViewScene from './ViewScene'
import { SCENE_PAGE_LIMIT } from '../../reducers/admin/scene/reducers'

interface Props {
  fetchSceneAdmin?: any
  adminSceneState?: any
  deleteScene?: any
}

const mapStateToProps = (state: any): any => ({
  adminSceneState: selectAdminSceneState(state)
})

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchSceneAdmin: bindActionCreators(fetchAdminScenes, dispatch),
  deleteScene: bindActionCreators(deleteScene, dispatch)
})

const SceneTable = (props: Props) => {
  const { fetchSceneAdmin, deleteScene, adminSceneState } = props
  const classx = useSceneStyles()
  const classes = useSceneStyle()
  const authState = useAuthState()
  const user = authState.user
  const scene = adminSceneState?.get('scenes')
  const sceneData = scene?.get('scenes')
  const sceneCount = scene?.get('total')
  const [singleScene, setSingleScene] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [showWarning, setShowWarning] = React.useState(false)
  const [sceneId, setSceneId] = React.useState('')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(SCENE_PAGE_LIMIT)

  React.useEffect(() => {
    if (user.id.value && scene.get('updateNeeded')) {
      fetchSceneAdmin()
    }
  }, [user, scene])

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    fetchSceneAdmin(incDec)
    setPage(newPage)
  }
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleClose = (open: boolean) => {
    setOpen(open)
  }

  const handleViewScene = (id: string) => {
    const scene = sceneData.find((sc) => sc.id === id)
    setSingleScene(scene)
    setOpen(true)
  }

  const handleShowWarning = (id: string) => {
    setSceneId(id)
    setShowWarning(true)
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
  }

  const deleteSceneHandler = () => {
    setShowWarning(false)
    deleteScene(sceneId)
  }

  const createData = (
    id: string,
    name: string,
    type: string,
    description: string,
    entity: any,
    version: any
  ): SceneData => {
    return {
      id,
      name,
      description,
      type,
      entity,
      version,
      action: (
        <>
          <a href="#h" className={classes.actionStyle}>
            <span className={classes.spanWhite} onClick={() => handleViewScene(id)}>
              View
            </span>
          </a>
          <a href="#h" className={classes.actionStyle} onClick={() => handleShowWarning(id)}>
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }

  const rows = sceneData.map((el) => {
    return createData(
      el.id,
      el.name || <span className={classes.spanNone}>None</span>,
      el.type || <span className={classes.spanNone}>None</span>,
      el.description || <span className={classes.spanNone}>None</span>,
      el.entities.length || <span className={classes.spanNone}>None</span>,
      el.version || <span className={classes.spanNone}>None</span>
    )
  })

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {sceneColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classx.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {sceneColumns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={column.id} align={column.align} className={classx.tableCellBody}>
                        {value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[SCENE_PAGE_LIMIT]}
        component="div"
        count={sceneCount || 12}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classx.tableFooter}
      />
      <Dialog
        open={showWarning}
        onClose={handleCloseWarning}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className={classes.alert} id="alert-dialog-title">
          {'Confirm to delete this scene!'}
        </DialogTitle>
        <DialogContent className={classes.alert}>
          <DialogContentText className={classes.alert} id="alert-dialog-description">
            Deleting scene can not be recovered!
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.alert}>
          <Button onClick={handleCloseWarning} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={deleteSceneHandler} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {singleScene && <ViewScene adminScene={singleScene} viewModal={open} closeViewModal={handleClose} />}
    </div>
  )
}
export default connect(mapStateToProps, mapDispatchToProps)(SceneTable)
