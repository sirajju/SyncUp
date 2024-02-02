import React from 'react'

function EditMessage() {
    return (
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                        <button type="button" className="btn-close" data-mdb-ripple-init data-mdb-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">...</div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-mdb-ripple-init data-mdb-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary" data-mdb-ripple-init>Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditMessage