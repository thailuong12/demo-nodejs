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
});
