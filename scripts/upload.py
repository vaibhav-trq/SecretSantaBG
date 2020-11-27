from firebase import Firebase
import csv

config = {
  "apiKey": "AIzaSyDjWIFqai6XVHVNWYZJpbHvwezTgy2hfJE",
  "authDomain": "secret-santa-bg.firebaseapp.com",
  "databaseURL": "https://secret-santa-bg.firebaseio.com",
  "projectId": "secret-santa-bg",
  "storageBucket": "secret-santa-bg.appspot.com",
  "messagingSenderId": "291078235364",
  "appId": "1:291078235364:web:e6777d9908fdb3387db8f1"
}

firebase = Firebase(config)
db = firebase.database()

# with open('v1_data.csv') as csvfile:
#   spamreader = csv.DictReader(csvfile)
#   for row in spamreader:
#     my_id = row['id']
#     del row['id']
#     row = dict(row)
#     row['shirt'] = 'XS'
#     # if not my_id:
#     #   print(my_id, row['name'])
#     if row['name'] == 'Chris Lee':
#       db.child('preferences').child(my_id).set(row)


# result = db.child('preferences').get()
# # print(result.key())
# for x in result.each():
#   print(x.val())

matches = """1627473510777929 ==> 10225298444472538
10224734363853099 ==> 10218308221111989
10165043949500019 ==> 10158989872208436
10224111098196373 ==> 10224734363853099
10225298444472538 ==> 10225035001248006
10224913208763408 ==> 1627473510777929
4174329462584252 ==> 10224055634609544
10219666112107524 ==> 10224351153746994
10225072410146334 ==> 10224111098196373
10214207761947026 ==> 10165043949500019
10224351153746994 ==> 10214207761947026
10218308221111989 ==> 10221352000422353
10158254968439965 ==> 10226763137930865
10158989872208436 ==> 4174329462584252
10221352000422353 ==> 10158254968439965
10226763137930865 ==> 10224913208763408
10224055634609544 ==> 10219666112107524
10225035001248006 ==> 10225072410146334"""

for l in matches.split('\n'):
  a, b = l.strip().split(' ==> ')
  db.child('preferences').child(a).update({'match': b})
  # print(a, b)