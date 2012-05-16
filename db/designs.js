module.exports = {
  users: {
    _id: '_design/users',
    language: 'javascript',
    views: {
      by_email: {
        map: function(doc){
          if (doc.type === 'user'){
            emit(doc.email, doc);
          }
        }
      },
      by_creation_date: {
        map: function(doc){
          if (doc.type === 'user'){
            var creation_date = new Date(doc.creation_date);
            emit(creation_date.getTime(), doc);
          }
        }
      }
    }
  },
  actions: {
    _id: '_design/actions',
    language: 'javascript',
    views: {
      by_user: {
        map: function (doc){
          if (doc.type === 'action'){
            var creation_date = new Date(doc.creation_date);
            emit([doc.user, doc.verb, creation_date.getTime()], doc);
          }
        }
      },
      by_subject: {
        map: function (doc){
          if (doc.type === 'action'){
            var creation_date = new Date(doc.creation_date);
            emit([doc.subject._id, doc.verb, creation_date.getTime()], doc);
          }
        }
      }
    }
  }
}
