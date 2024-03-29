visual-feature
==============

// servicechannel github enterprise
export PORT=3000
export githubClientId=ff8f47333741843bf5f9
export githubSecretKey=43fffed62814d610c32ea881edfbfbadf26880d5

export githubClientId=d24dfef0f98062c793f6
export githubSecretKey=e5fe11d7e985757ebf8af9d48392b8f8077d1fb9

Users
- email: String
- github: { ClientID: ‘', SecretKey: ‘’, url: '’ }
- accessToken: String
- refreshToken: String
- role: String (Admin, Standard)
- accounts: [Account]

Accounts
- name: String
- github: { Organization: String, Enterprise: Boolean, Url: String }
- users: [User]
- environments: [Environment]
- projects: [Project]

Environments
- name: String
- description: String
- createdOn: Date

Projects
- name: String
- description: String
- environments: [Environment] 
- createdOn: Date

Аккаунт Сервиса
1) может иметь нескольких пользователей 
2) при регистрации нового пользователя создается аккаунт. только администратор github может зарегистрировать аккаунт без приглашения.
3) пользователь может пригласить других пользователей присоединиться к этому account
4) приглашенные пользователи должны присоединяться к существующему account в который из пригласили и только в случае наличия доступа к этой организации в github. по идее можно показать список всех членов организации на странице приглашений с возможностью пригласить всех или по одному
5) оплата за использование сервиса должна быть привязана к account
6) аккаунт должен быть привязан к определенной организации github

Среды разработки
1) аккаунт может иметь несколько настроек сред разработки, которые могут применяться к разным проектам аккаунта
2) настройка разработки включает список всех сред разработки которые используются в организации
3) среда включает название и описание
4) когда настройки сред применяются к проекту то во всех repositories проектах создаются соответствующие бранчи (используется название среды)

Пользователь Сервиса
1) может зарегистрироваться в системе используя логин github или github enterprise
2) может ответить на приглашение от пользователя системы и зарегистрироваться используя логин github или github enterprise
3) пользователь может видеть все проекты аккаунта, но сможет редактировать только при наличии пуш доступа. редактирование также может контролироваться настройками доступа пользователя в этом аккаунте
4) пользователь может иметь доступ к нескольким аккаунтам Навиам
5) пользователь должен задать свои интеграции

Проект сервиса:
1) может объединять несколько проектов pivotaltracker или иных сервисов управления разработкой. все истории из этих проектов будут скачиваться в один проект Навиам и отображаться как один проект.
2) обязательно должен быть связан с одним репозиторием github или иного сервиса гита. возможна связка с несколькими репозиториями
3) связан со средами которые определены в настройках аккаунта Навиам. эти среды накладываются на все связанные с проектом репозитории
4) Пользователь должен создать проект в нашей системе. На форме создания он должен указать название проекта, выбрать один или несколько репозиторием для привязки к проекту, опционально выбрать один или более проектов pivotaltracker. выбрать настройки енвайронментов из существующих для данного аккаунта. если настроек сред нет, пользователь должен указать список сред
5) если пользователь не создал ни одного проекта то страница дашборда должна показать пустой экран с надписью что система пока не имеет не одного проекта, пожалуйста создайте.

Регистрация нового пользователя

Step 1. Вывести две кнопки регистрации с помощью Github и Github Enterprise. Для Github Enterprise показать поле для ввода собственного домена где размещен сервер Github. 
Step 2. Запросить у Github информацию по пользователю и его правам доступа и к его организациям и репозиториям.
Step 3. При успешном получении информации из Github попросить пользователя выбрать какую организацию Github связать с Naviam account. Вопрос: нужно ли позволять связывать более чем одну организацию Github с Naviam account?
Step 4. Попросить пользователя добавить интеграцию с PivotalTracker
Step 5. Поблагодарить за регистрацию и вывести страницу дашборда.

Форма создания проекта

Вывести поле для ввода проекта и
Step 1. Попросить пользователя выбрать репозиторий (или несколько репозиториев) для связки с проектом.
Step 2. Если имя проекта пустое. то автоматически заполнить его именем первого выбранного репозитория
Step 3. Попросить пользователя выбрать один или несколько проектов PivotalTracker
Step 4. Попросить пользователя выбрать название сред организации
Автоматические шаги (показать бар прогресса):
Step 5. Создать бранчи соответствующие названиям сред в прикрепленных репозиториях
Step 6. Загрузить историю коммитов для каждого бранча 
Step 7. Загрузить все открытые pull requests в мастер
Step 8. Вычислить связи с историями в проектах PivotalTracker
Step 9. Вычислить на каких средах сейчас находятся истории (на каком этапе)
Step 10. Сохранить в свою базу истории и информацию о средах на которых они находятся
Step 11. Подписаться на изменения в Github
Step 12. Подписаться на изменения в PivotalTracker
Показать таблицу с историями

Действия при загрузки страницы дашборда

Step 1. Загрузить истории из нашей базы
Step 2. Запустить синхронизацию с Github и PivotalTracker
Step 3. Показать таблицу с историями


Good node.js articles and resources:

About Express Basic Auth module: http://blog.modulus.io/nodejs-and-express-basic-authentication 

