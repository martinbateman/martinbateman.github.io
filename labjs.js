lis = document.getElementById ('instructions').getElementsByTagName ('li');
for (i = 0; i < lis.length; i ++){
  lis[i].setAttribute ("id", i);
  lis[i].setAttribute ("onclick", "javascript:clicked("+i+")");
}


var data = loadFromCookie();
if (data) {
  if (!baseUrl)
    msGraphApiRoot = data.apiRoot;
  showCustomLoginButton(!data.signedin)
}

$(document).on({
  ajaxStart: function() {$('body').addClass('loading');},
  ajaxStop:  function() {$('body').removeClass('loading');}
});


var baseUrl = getQueryVariable("baseUrl")
msGraphApiRoot = (baseUrl) ? baseUrl : "https://graph.microsoft.com/v1.0/me";


function uploadItem (){
          var contentURL = msGraphApiRoot + "/drive/items/" + itemID + "/content";

          lis = document.getElementById ('instructions').getElementsByTagName ('li');
          var labData = Array (lis.length);
          for (i = 0; i < lis.length; i ++){
            if (lis[i].getAttribute ("class") == "tick") {
              labData[i] = 1;
            } else {
              labData[i] = 0;
            }
          }

          $.ajax({
            url: contentURL,
            dataType: 'json',
            type: 'put',
            headers: { "Authorization": "Bearer " + globalToken },
            data: JSON.stringify (labData),
            success: function(data) {
              if (data) {
              }
            }
          });
    return (false);
    }


    function downloadItem (){
          var createAddDir = msGraphApiRoot + "/drive/root/children";
          var appDataID = "";

          var createFolder = {
            "name": settingDir,
            "folder": { },
            "@microsoft.graph.conflictBehavior": "fail" // if it doesn't work it exists so don't worry (famous last words)
          };

          $.ajax({
            url: createAddDir,
            dataType: 'json',
            contentType: 'application/json',
            type: 'post',
            async: false,
            headers: { "Authorization": "Bearer " + globalToken },
            accept: "application/json;odata.metadata=none",
            data: JSON.stringify (createFolder)
          });


          var contentURL = msGraphApiRoot + "/drive/root:" + fileName;
          $.ajax({
            url: contentURL,
            dataType: 'json',
            headers: { "Authorization": "Bearer " + globalToken },
            accept: "application/json;odata.metadata=none",
            success: function(data) {
              if (data) {
                itemID = data['id'];
                $('#od-value').val (data['@microsoft.graph.downloadUrl']);
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                  var labData = JSON.parse (xhttp.responseText);
                  lis = document.getElementById ('instructions').getElementsByTagName ('li');
                  for (var i = 0; i < lis.length; i ++){
                    var isChecked = labData[i];
                    if (isChecked == 1){
                      clicked (i);
                    }
                  }
                document.getElementById("od-title").innerHTML = pageTitle;
                saved = 1;
                }
                };
                xhttp.open("GET", data['@microsoft.graph.downloadUrl'], true);
                xhttp.send();
              }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
              // creating the setting file since it doesn't exist
            var contentURL = msGraphApiRoot + "/drive/root:" + fileName + ":/content";
            $.ajax({
              url: contentURL,
              dataType: 'json',
              contentType: 'text/plain',
              type: 'put',
              async: false,
              data: "[]",
              headers: { "Authorization": "Bearer " + globalToken },
              accept: "application/json;odata.metadata=none",
              success: function (data){
                if (data){
                  itemID = data['id'];
                }
              }
            });
              uploadItem ();
            }
          });
    return (false);
    }

function clicked (cellID){
  if (globalToken != ""){
    saved = 0;
    document.getElementById("od-title").innerHTML = pageTitle + " (not saved)";
  }

  // set/remove colour background
  var parent = document.getElementById (cellID);
  if (parent.getAttribute ("class") == "tick") {
    parent.removeAttribute ("class");
    for (i = cellID-1; i >= 0; i --){
      li = document.getElementById (i);
      if (li.getAttribute ("class") == "tick") {
        break;
      } else {
        li.removeAttribute ("class");
      }
    }

  } else {
    parent.setAttribute ("class", "tick");
    for (i = cellID-1; i >= 0; i --){
      li = document.getElementById (i);
      if (li.getAttribute ("class") != "tick") {
        li.setAttribute ("class", "missed");
      }
    }
  }
  lis = document.getElementById ('instructions').getElementsByTagName ('li');
  var last = -1;
  var noSelected = 0;
  for (var i = 0; i < lis.length; i ++){
    if (lis[i].getAttribute ("class") == "tick") {
      last = i;
      noSelected = noSelected + 1;
    }
  }

  percent = (noSelected/lis.length) * 100;
  nanobar.go (percent);

  for (var i = 0; i < last; i ++){
    if (lis[i].getAttribute ("class") != "tick") {
      lis[i].setAttribute ("class", "missed");
    }
  }
}

var options = {
  classname: 'my-class',
  id: 'my-id',
  target: document.getElementById('myDivId')
};

var nanobar = new Nanobar( options );
odauth ();
