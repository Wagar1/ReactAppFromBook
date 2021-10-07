import { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1'; 
const PATH_SEARCH = '/search'; 
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      result: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
    }

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this); 
    this.setSearchTopStories = this.setSearchTopStories.bind(this); 
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this); 
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this); 
    this.onDismiss = this.onDismiss.bind(this);
  }

  needsToSearchTopStories(searchTerm) { 
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStories(searchTerm, page = 0) { 
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`) 
    .then(response => response.json()) 
    .then(result => this.setSearchTopStories(result)) 
    .catch(error => error); 
  }

  setSearchTopStories(result) { 
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey] 
        ? results[searchKey].hits 
        : [];
    
    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({ 
      results: { 
        ...results, 
        [searchKey]: { hits: updatedHits, page } 
      } 
    }); 
  }

  onSearchSubmit(event) { 
    const { searchTerm } = this.state; 
    this.setState({ searchKey: searchTerm }); 
    if (this.needsToSearchTopStories(searchTerm)) { 
      this.fetchSearchTopStories(searchTerm); 
    }
    this.fetchSearchTopStories(searchTerm);
    event.preventDefault();
  }

  onSearchChange(event){
    this.setState({ searchTerm: event.target.value });
  }

  onDismiss(id){
    const { searchKey, results } = this.state; 
    const { hits, page } = results[searchKey];
    const isNotId = item => item.objectID !== id; 
    const updatedHits = hits.filter(isNotId);
    this.setState({ result: { results, [searchKey]: { hits: updatedHits, page } } });
  }

  componentDidMount() { 
      const { searchTerm } = this.state;
      this.setState({ searchKey: searchTerm }); 
      this.fetchSearchTopStories(searchTerm);
  }

  render(){
    const { searchTerm, results, searchKey } = this.state;
    const page = ( results && results[searchKey] && results[searchKey].page ) || 0;
    const list = ( results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange} 
            onSubmit={this.onSearchSubmit}
          >
            Search 
          </Search>
        </div>
          <Table 
            list={list} 
            onDismiss={this.onDismiss} 
          />
        <div className="interactions"> 
          <Button onClick={() => this.fetchSearchTopStories(searchTerm, page + 1)}>More</Button> 
        </div>
        </div>
    );
  }
}

const Search = ({ value, onChange, onSubmit, children }) => 
  <form onSubmit={onSubmit}> 
    {children}
    <input 
      type="text" 
      value={value} 
      onChange={onChange} 
    /> 
    <button type="submit">{children}</button>
  </form> 

class Table extends Component { 
  render() { 
    const largeColumn = { width: '40%', };
    const midColumn = { width: '30%', };
    const smallColumn = { width: '10%', };
    const { list, onDismiss } = this.props; 
    return ( 
      <div className="table"> 
        { list.map(item => 
          <div key={item.objectID} className="table-row">  
            <span style={largeColumn}> <a href={item.url}>{item.title}</a> </span>
            <span style={midColumn}>{item.author}</span>
            <span style={smallColumn}>{item.num_comments}</span>
            <span style={smallColumn}>{item.points}</span> 
            <span style={smallColumn}>
              <Button className="button-inline"
                      onClick={() => onDismiss(item.objectID)}> 
                Dismiss 
              </Button>
            </span> 
          </div> )
        } 
      </div> 
    ); 
  } 
}

class Button extends Component { 
  render() { 
    const { onClick, className = '', children, } = this.props;
    return ( 
      <button onClick={onClick} className={className} type="button"> 
        {children} 
      </button> 
    );
  }
}

export default App;
