import React from "react";

export default class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error) {
		return { error };
	}

	render() {
		if (this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback(this.state.error);
			}

			return (
				<span class="generic-error">
					{this.state.error.message || "Unknown error"}
				</span>
			);
		}
		return this.props.children;
	}
}
