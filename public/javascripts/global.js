/****************************************************************************/
// projectlist data array for filling in info box
/****************************************************************************/
var projectlistData = [];

/****************************************************************************/
/****************************************************************************/
//============================== DOM Ready ==================================
/****************************************************************************/
/****************************************************************************/
$(document).ready(function() {

  // Populate the user table on initial page load
  populateTable();

  // Username link click
  $('#projectlist table tbody').on('click', 'td a.linkshowuser', showProjectInfo);

  // Add User button click
  $('#btnAddUser').on('click', addProject);

  // Dowload User link click
    $('#projectlist table tbody').on('click', 'td a.linkdownload', printout);

  // Delete User link click
  $('#projectlist table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

});

/****************************************************************************/
/****************************************************************************/
//========================== Functions ======================================
/****************************************************************************/
/****************************************************************************/

/****************************************************************************
* Fill table with data
 ****************************************************************************/
function populateTable() {

  // Empty content string
  var tableContent = '';

  // jQuery AJAX call for JSON
  $.getJSON( '/users/projectlist', function( data ) {

    // Stick our user data array into a projectlist variable in the global object
    projectlistData = data;

    // For each item in our JSON, add a table row and cells to the content string
    $.each(data, function(){
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.project_name + '" title="Show Details">' + this.project_name + '</a></td>';
      tableContent += '<td>' + new Date(this._created_at).toLocaleDateString() + '</td>';
      tableContent += '<td><a href="#" class="linkdownload" rel="'   + this._id + '">Ladda ned</a></td>';
      tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">Radera</a></td>';
      tableContent += '</tr>';
    });

    // Inject the whole content string into our existing HTML table
    $('#projectlist table tbody').html(tableContent);
  });
};

/****************************************************************************
* Show Project Info
 ****************************************************************************/
function showProjectInfo(event) {

  // Prevent Link from Firing
  event.preventDefault();

  // Retrieve username from link rel attribute
  var thisUserName = $(this).attr('rel');

  // Get Index of object based on id value
  var arrayPosition = projectlistData.map(function(arrayItem) { return arrayItem.project_name; }).indexOf(thisUserName);

  // Get our User Object
  var thisUserObject = projectlistData[arrayPosition];
   // var confirmation = confirm(projectlistData[0].project_name);
  //Populate Info Box
  $('#projectInfoName').text(thisUserObject.project_name);
  $('#projectInfoEnable').text(new Date(thisUserObject._created_at).toLocaleDateString());
};

/****************************************************************************
* Add User
****************************************************************************/
function addProject(event) {
  event.preventDefault();

  // Super basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#addProject input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });

  // Check and make sure errorCount's still at zero
  if(errorCount === 0) {
/*
* "_id" : "0qq8pBmXwf",
    "enabled" : false,
    "project_name" : "Sean Plott",
    "_created_at" : ISODate("2017-10-29T18:45:26.338Z"),
    "_updated_at" : ISODate("2017-10-29T18:45:26.338Z")
* */
    // If it is, compile all user info into one object
    var newProject = {
      'project_name': $('#addProject fieldset input#inputProjectName').val(),
      'enabled': $('#addProject fieldset input#inputEnabled').val(),
      '_created_at': $('#addProject fieldset input#input_created_at').val(),
      '_updated_at': $('#addProject fieldset input#input_updated_at').val()
    }

    // Use AJAX to post the object to our adduser service
    $.ajax({
      type: 'POST',
      data: newProject,
      url: '/users/adduser',
      dataType: 'JSON'
    }).done(function( response ) {

      // Check for successful (blank) response
      if (response.msg === '') {

        // Clear the form inputs
        $('#addProject fieldset input').val('');

        // Update the table
        populateTable();

      }
      else {

        // If something goes wrong, alert the error message that our service returned
        alert('Error: ' + response.msg);

      }
    });
  }
  else {
    // If errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};

/****************************************************************************
 *  Print values.
****************************************************************************/
function printout(event){
    var confirmation = confirm(this.id.value);
    var textFile = null,
        makeTextFile = function (text) {
            var data = new Blob([text], {type: 'text/plain'});

            // If we are replacing a previously generated file we need to
            // manually revoke the object URL to avoid memory leaks.
            if (textFile !== null) {
                window.URL.revokeObjectURL(textFile);
            }

            textFile = window.URL.createObjectURL(data);

            // returns a URL you can use as a href
            return textFile;
        };
}

/****************************************************************************
* Delete User
****************************************************************************/
function deleteUser(event) {

  event.preventDefault();

  // Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this user?');

  // Check and make sure the user confirmed
  if (confirmation === true) {

    // If they did, do our delete
    $.ajax({
      type: 'DELETE',
      url: '/users/deleteuser/' + $(this).attr('rel')
    }).done(function( response ) {

      // Check for a successful (blank) response
      if (response.msg === '') {
      }
      else {
        alert('Error: ' + response.msg);
      }

      // Update the table
      populateTable();

    });

  }
  else {

    // If they said no to the confirm, do nothing
    return false;

  }

};