$(document).ready(() => {
  $('#deleteContacts').click(() => {
    const listContactNeedToBeDelete = []
    const checkboxes = $(':checkbox');
    for (const checkbox of checkboxes) {
      const id = checkbox.getAttribute('id')
      const checkedStatus = $(`#${id}`).is(':checked')
      if (checkedStatus) {
        listContactNeedToBeDelete.push(id);
      }
    }
    const token = document.getElementById('csrf').getAttribute('value');
    if (listContactNeedToBeDelete.length > 0) {
      $.ajax({
        type: 'DELETE',
        url: '/contact/delete',
        data: { listContactNeedToBeDelete },
        success: function () {
          location.reload();
        },
        headers: {
          'X-CSRF-Token': token
        },
      });
    }
  });
  $('#fileImport').change(() => {
    const token = document.getElementById('csrf').getAttribute('value');
    const fileInput = document.getElementById('fileImport');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/contact/import', true);
    // xhr.setRequestHeader('Content-Type', 'multipart/form-data')
    xhr.setRequestHeader('X-CSRF-Token', token);
    xhr.send(formData);
    xhr.onload = () => {
      location.reload();
    }
    return false;
  });
});
