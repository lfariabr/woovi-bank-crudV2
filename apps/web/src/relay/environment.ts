import { Environment, RecordSource, Store } from 'relay-runtime';
import { createNetwork } from './network';

const IS_SERVER = typeof window === typeof undefined;
const CLIENT_DEBUG = false;
const SERVER_DEBUG = false;

// Global singleton environment instance
let globalEnvironment: Environment | undefined;

/**
 * Creates a Relay Environment singleton or returns the existing one
 * This ensures consistent environment usage across the application
 */
function createEnvironment(): Environment {
	// For SSR, always create a new environment
	if (IS_SERVER) {
		return makeEnvironment();
	}

	// On client, reuse the environment instance for consistent query/mutation handling
	if (globalEnvironment === undefined) {
		globalEnvironment = makeEnvironment();
	}

	return globalEnvironment;
}

// Internal function to create a new environment instance
function makeEnvironment(): Environment {
	const network = createNetwork();
	const environment = new Environment({
		network,
		store: new Store(new RecordSource(), {}),
		isServer: IS_SERVER,
		log(event) {
			if ((IS_SERVER && SERVER_DEBUG) || (!IS_SERVER && CLIENT_DEBUG)) {
				console.debug('[relay environment event]', event);
			}
		},
	});

	// @ts-ignore Private API Hackery? 🤷‍♂️
	environment.getNetwork().responseCache = network.responseCache;

	return environment;
}

export { createEnvironment };
