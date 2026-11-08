const columns = [
	{ name: "NOMBRE", uid: "name", sortable: true },
	{ name: "DATOS", uid: "email" },
	{ name: "ROLES", uid: "roles", sortable: true },
	{ name: "ESTADO", uid: "active", sortable: true },
	{ name: "ACCIONES", uid: "actions" },
];

const statusOptions = [
	{ name: "Activo", uid: "active" },
	{ name: "Inactivo", uid: "inactive" },
];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Martinez'];
const roles = ['administrator', 'tour_guide', 'tourist'];

interface User {
	id: number;
	name: string;
	last_name: string;
	roles: string[];
	team: string;
	active: boolean;
	phone: string;
	age: string;
	avatar: string;
	email: string;
}

const users: User[] = [
	{
		id: 1,
		name: "Tony Reichert",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Management",
		active: true,
		phone: "+1 234 567 890",
		age: "29",
		avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
		email: "tony.reichert@example.com",
	},
	{
		id: 2,
		name: "Zoey Lang",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Development",
		active: false,
		phone: "+1 234 567 890",
		age: "25",
		avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
		email: "zoey.lang@example.com",
	},
	{
		id: 3,
		name: "Jane Fisher",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Development",
		active: true,
		phone: "+1 234 567 890",
		age: "22",
		avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
		email: "jane.fisher@example.com",
	},
	{
		id: 4,
		name: "William Howard",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Marketing",
		active: true,
		phone: "+1 234 567 890",
		age: "28",
		avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
		email: "william.howard@example.com",
	},
	{
		id: 5,
		name: "Kristen Copper",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Sales",
		active: true,
		phone: "+1 234 567 890",
		age: "24",
		avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
		email: "kristen.cooper@example.com",
	},
	{
		id: 6,
		name: "Brian Kim",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Management",
		age: "29",
		avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
		email: "brian.kim@example.com",
		phone: "+1 234 567 890", active: true,

	},
	{
		id: 7,
		name: "Michael Hunt",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Design",
		active: false,
		phone: "+1 234 567 890",
		age: "27",
		avatar: "https://i.pravatar.cc/150?u=a042581f4e29027007d",
		email: "michael.hunt@example.com",
	},
	{
		id: 8,
		name: "Samantha Brooks",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "HR",
		active: true,
		phone: "+1 234 567 890",
		age: "31",
		avatar: "https://i.pravatar.cc/150?u=a042581f4e27027008d",
		email: "samantha.brooks@example.com",
	},
	{
		id: 9,
		name: "Frank Harrison",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Finance",
		active: true,
		phone: "+1 234 567 890",
		age: "33",
		avatar: "https://i.pravatar.cc/150?img=4",
		email: "frank.harrison@example.com",
	},
	{
		id: 10,
		name: "Emma Adams",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Operations",
		active: true,
		phone: "+1 234 567 890",
		age: "35",
		avatar: "https://i.pravatar.cc/150?img=5",
		email: "emma.adams@example.com",
	},
	{
		id: 11,
		name: "Brandon Stevens",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Development",
		active: true,
		phone: "+1 234 567 890",
		age: "22",
		avatar: "https://i.pravatar.cc/150?img=8",
		email: "brandon.stevens@example.com",
	},
	{
		id: 12,
		name: "Megan Richards",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Product",
		active: false,
		phone: "+1 234 567 890",
		age: "28",
		avatar: "https://i.pravatar.cc/150?img=10",
		email: "megan.richards@example.com",
	},
	{
		id: 13,
		name: "Oliver Scott",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Security",
		active: true,
		phone: "+1 234 567 890",
		age: "37",
		avatar: "https://i.pravatar.cc/150?img=12",
		email: "oliver.scott@example.com",
	},
	{
		id: 14,
		name: "Grace Allen",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Marketing",
		active: true,
		phone: "+1 234 567 890",
		age: "30",
		avatar: "https://i.pravatar.cc/150?img=16",
		email: "grace.allen@example.com",
	},
	{
		id: 15,
		name: "Noah Carter",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "I. Technology",
		active: false,
		phone: "+1 234 567 890",
		age: "31",
		avatar: "https://i.pravatar.cc/150?img=15",
		email: "noah.carter@example.com",
	},
	{
		id: 16,
		name: "Ava Perez",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Sales",
		active: true,
		phone: "+1 234 567 890",
		age: "29",
		avatar: "https://i.pravatar.cc/150?img=20",
		email: "ava.perez@example.com",
	},
	{
		id: 17,
		name: "Liam Johnson",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Analysis",
		active: true,
		phone: "+1 234 567 890",
		age: "28",
		avatar: "https://i.pravatar.cc/150?img=33",
		email: "liam.johnson@example.com",
	},
	{
		id: 18,
		name: "Sophia Taylor",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Testing",
		active: true,
		phone: "+1 234 567 890",
		age: "27",
		avatar: "https://i.pravatar.cc/150?img=29",
		email: "sophia.taylor@example.com",
	},
	{
		id: 19,
		name: "Lucas Harris",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Information Technology",
		active: false,
		phone: "+1 234 567 890",
		age: "32",
		avatar: "https://i.pravatar.cc/150?img=50",
		email: "lucas.harris@example.com",
	},
	{
		id: 20,
		name: "Mia Robinson",
		last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
		roles: [],
		team: "Operations",
		active: true,
		phone: "+1 234 567 890",
		age: "26",
		avatar: "https://i.pravatar.cc/150?img=45",
		email: "mia.robinson@example.com",
	},
];

users.forEach(user => {
	const userRoles: string[] = [];
	const rolesCount = Math.max(1, Math.floor(Math.random() * 4));

	for (let i = 0; i < rolesCount; i++) {
		const randomIndex = Math.floor(Math.random() * roles.length);
		if (!userRoles.includes(roles[randomIndex])) {
			userRoles.push(roles[randomIndex]);
		}
	}

	user.roles = userRoles;
});

export { columns, users, statusOptions };