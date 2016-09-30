import 'bootstrap/js/tooltip';
import ToDoList from './models/ToDoList.js';

$(function(){
  var tableArea = $('.appendClone'),
    addToDoButton = $('.save'),
    sortButtons = $('.sort'),
    savedData = localStorage.getItem('ToDoList'),
    savedToDos = savedData ? JSON.parse(savedData) : [],
    myToDoList = new ToDoList(savedToDos),
    toDoInput = $('#to-do-item'),
    toggleVisibility = $('.visibility-toggle'),
    clearCompletedLink = $('.clear-completed');

  writeToDoList(tableArea, myToDoList.render('template'));

  //Fade in add-to-do controls
  toDoInput.on('input', function(){
    if (!$(this).val()) {

      //stop function if to-do items are listed.
      if(myToDoList.toDoItems.length > 0) return;

      //otherwise hide visible elements since input val is falsy
      toggleVisibility.each(function () {
        if (!$(this).hasClass('not-visible')) {
          $(this).addClass('not-visible');
        }
      })
    }
    //Since input val is truthy, make sure elements are visible.
    else {
      toggleVisibility.each(function () {
        if ($(this).hasClass('not-visible')) {
          $(this).removeClass('not-visible');
        }
      });
    }
  });

  //Make rows sortable
  /*tableArea.sortable({
    handle: '.handle',
    axis:'y',
    helper: function(e, tr)
    {
      var $originals = tr.children();
      var $helper = tr.clone();
      //console.log($helper.children().length);
      $helper.children().each(function(index)
      {
        // Set helper cell sizes to match the original sizes
        console.log($originals.eq(index).outerWidth());
        $(this).width($originals.eq(index).outerWidth());
      });
      return $helper;
    },
    stop: function (e, tr) {
      var sortOrder = [];
      tableArea.find('tr').each(function(){
        var thisUID = $(this).attr('id');
        sortOrder.push(thisUID);
      });

      myToDoList
        .sortByUID(sortOrder)
        .save();

      writeToDoList(tableArea, myToDoList.render('template'));
    }
  });*/

  //Listen for Item Add
  addToDoButton.click(function(e){
    e.preventDefault();
    var toDoItem = toDoInput.val();
    var rankedClass = $('.beenRated');
    var itemRank = rankedClass.length;
    var newToDo = {
      item : toDoItem,
      rank : itemRank
    };

    //Add Item
    addToDo(newToDo, toDoInput, rankedClass);
  });

  //Listen for and Handle Column Sorts
  sortButtons.click(function(){
    var btn = $(this);
    var column = btn.attr('data-attr');
    var currentSortDirection = btn.hasClass('glyphicon-sort-by-attributes') ? 'asc' : 'desc';
    var nextSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';

    //Sort Column
    sortColumn(btn, column, currentSortDirection, nextSortDirection);
  });

  //Listen for & handle 'clear completed' link
  clearCompletedLink.click(function (e) {
    e.preventDefault();
    myToDoList
      .clearCompleted()
      .save();

    writeToDoList(tableArea, myToDoList.render('template'));
  });

  //Listen for and Handle Action Buttons
  tableArea.click(function(e){
    var action = $(e.target);

    //Delete To-Do.
    if (action.hasClass('rmvIt')) {
      var elementToDelete = action.attr('data-item');
      myToDoList
        .remove(elementToDelete)
        .sortByStatus()
        .markFirstCompleted()
        .save();

      writeToDoList(tableArea, myToDoList.render('template'));
    }

    //Mark To-Do Complete
    if (action.hasClass('glyphicon-unchecked')) {
      var completedToDo = action.attr('data-item');
      myToDoList
        .complete(completedToDo)
        .sortByStatus()
        .markFirstCompleted()
        .save();

      writeToDoList(tableArea, myToDoList.render('template'));
    }

    //Mark To-Do Incomplete
    if (action.hasClass('glyphicon-check')) {
      var uncompletedToDo = action.attr('data-item');
      myToDoList
        .notComplete(uncompletedToDo)
        .sortByStatus()
        .markFirstCompleted()
        .save();

      writeToDoList(tableArea, myToDoList.render('template'));
    }

    //Make To-Do Editable
    if (action.hasClass('glyphicon-edit')) {
      var toDoToEdit = action.attr('data-item');
      var toDoRow = $('#' + toDoToEdit);

      writeToDoList(toDoRow, myToDoList.renderEditable('edit-row', toDoToEdit));
    }

    //Save Edits
    if (action.hasClass('glyphicon-save')) {
      var toDoToUpdate = action.attr('data-item');
      var itemToUpdate = $('#item-' + toDoToUpdate).val();
      var rankingToUpdate = $('#stars-' + toDoToUpdate).find('.beenRated').length;
      var allEdits = {
        'item' : itemToUpdate,
        'rank' : rankingToUpdate
      };

      myToDoList
        .edit(toDoToUpdate, allEdits)
        .save();

      writeToDoList(tableArea, myToDoList.render('template'))
    }

    //Cancel Editing
    if (action.hasClass('cancel-edits')) {
      writeToDoList(tableArea, myToDoList.render('template'));
    }
  });

  /**
   * Updates or writes to-do list to dom and sets listeners for
   * future user interactions. Optional callback provided.
   *
   * @param container {jQuery} - HTML table body to which HTML is appended
   * @param HTML {String} - Table rows in html.
   * @param cb [Function] - Optional Callback function.
   */
  function writeToDoList(container, HTML, cb) {
    //Populate Table or Row
    container
      .empty()
      .html(HTML);

    //Show clear completed link if there are completed items
    if (myToDoList.hasCompletedItems()) {
      if (!clearCompletedLink.hasClass('fade-in')) clearCompletedLink.addClass('fade-in');
    }
    else {
      if (clearCompletedLink.hasClass('fade-in')) clearCompletedLink.removeClass('fade-in');
    }

    //Activate Tool-tips
    activateToolTips($('[data-toggle="tooltip"]'));

    //Set listeners for rankings
    listenForRank($('.stars'));

    //Fade in add-to-do controls if needed
    if (myToDoList.toDoItems.length > 0) {
      toggleVisibility
        .each(function () {
          if ($(this).hasClass('not-visible')) {
            $(this).removeClass('not-visible');
          }
        });
    }

    else {
      toggleVisibility
        .each(function () {
          if(!$(this).hasClass('not-visible')) {
            $(this).addClass('not-visible');
          }
        })
    }

    //Callback (if provided)
     if (cb) {
       cb();
     }
  }

  /**
   * Listens for ranking events. Can be called
   * multiple times for new Dom content.
   *
   * @param starWrapper {jQuery}
   */
  function listenForRank(starWrapper) {
    //Set 'Select Ranking' Listeners:
    starWrapper.on('mouseover', '.star', function(){
      var el = $(this);
      el.addClass('active');
      el.prevAll('.star').addClass('active');
    });

    starWrapper.on('mouseout', '.star', function() {
      var el = $(this);
      el.removeClass('active');
      el.prevAll('.star').removeClass('active');
    });

    starWrapper.on('click', '.star', function(){
      var el = $(this);
      //Clear previous rating.
      $('.beenRated').each(function(){
        $(this).removeClass('beenRated');
      });
      //Add current rating
      el.addClass('beenRated').removeClass('active');
      el.prevAll('.star').addClass('beenRated').removeClass('active');
    });
  }

  /**
   * Activates Bootstrap's tooltips. Can be called
   * multiple times for new Dom content.
   *
   * @param toolTips {jQuery}
   */
  function activateToolTips(toolTips) {
    /*$('[data-toggle="tooltip"]')*/

    toolTips.tooltip({
      template : '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
      delay: { "show": 1000, "hide": 100 }
    });
  }

  /**
   * Adds to-do item to class and writes table
   *
   * @param newToDo {Object}
   * @param toDoInput {jQuery}
   * @param rankedClass {jQuery}
   */
  function addToDo(newToDo, toDoInput, rankedClass) {

    myToDoList
      .add(newToDo)
      .sortByStatus()
      .markFirstCompleted()
      .save();

    writeToDoList(tableArea, myToDoList.render('template'), function(){
      toDoInput.val('');
      rankedClass.each(function(){
        $(this).removeClass('beenRated');
      })
    });
  }

  /**
   * Sorts to-do list by column and writes table.
   *
   * @param btn {jQuery}
   * @param column {String} - 'item' or 'rank'
   * @param currentSortDirection {String} - 'asc' or 'desc'
   * @param nextSortDirection {String} - 'asc' or 'des'
   */
  function sortColumn(btn, column, currentSortDirection, nextSortDirection) {
    var icons = {
      'asc' : 'glyphicon-sort-by-attributes',
      'desc' : 'glyphicon-sort-by-attributes-alt'
    };

    myToDoList
      .sortIncompleteBy(column, nextSortDirection)
      .markFirstCompleted()
      .save();

    writeToDoList(tableArea, myToDoList.render('template'), function(){
      btn
        .removeClass(icons[currentSortDirection])
        .addClass(icons[nextSortDirection]);
    });
  }

});