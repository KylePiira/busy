import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { injectIntl, FormattedMessage, FormattedRelative, FormattedDate, FormattedTime } from 'react-intl';
import { Link } from 'react-router-dom';
import { Tag, Icon, Popover, Tooltip } from 'antd';
import Lightbox from 'react-image-lightbox';
import { formatter } from 'steem';
import Body from './Body';
import StoryFooter from './StoryFooter';
import Avatar from '../Avatar';
import Topic from '../Button/Topic';
import PopoverMenu, { PopoverMenuItem } from '../PopoverMenu/PopoverMenu';
import './StoryFull.less';

@injectIntl
class StoryFull extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    post: PropTypes.shape().isRequired,
    postState: PropTypes.shape().isRequired,
    pendingLike: PropTypes.bool,
    pendingFollow: PropTypes.bool,
    commentCount: PropTypes.number,
    onFollowClick: PropTypes.func,
    onSaveClick: PropTypes.func,
    onReportClick: PropTypes.func,
    onLikeClick: PropTypes.func,
    onShareClick: PropTypes.func,
  };

  static defaultProps = {
    pendingLike: false,
    pendingFollow: false,
    commentCount: 0,
    onFollowClick: () => {},
    onSaveClick: () => {},
    onReportClick: () => {},
    onLikeClick: () => {},
    onShareClick: () => {},
    postState: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      lightbox: {
        open: false,
        index: 0,
      },
    };
  }

  componentDidMount() {
    document.body.classList.add('white-bg');
  }

  componentWillUnmount() {
    document.body.classList.remove('white-bg');
  }

  handleClick = (key) => {
    switch (key) {
      case 'follow':
        this.props.onFollowClick(this.props.post);
        return;
      case 'save':
        this.props.onSaveClick();
        return;
      case 'report':
        this.props.onReportClick();
        break;
      default:
    }
  };

  handleContentClick = (e) => {
    if (e.target.tagName === 'IMG') {
      const tags = this.contentDiv.getElementsByTagName('img');
      for (let i = 0; i < tags.length; i += 1) {
        if (tags[i] === e.target) {
          this.setState({
            lightbox: {
              open: true,
              index: i,
            },
          });
        }
      }
    }
  };

  render() {
    const {
      intl,
      post,
      postState,
      pendingLike,
      pendingFollow,
      commentCount,
      onLikeClick,
      onShareClick,
    } = this.props;

    const { open, index } = this.state.lightbox;
    const images = JSON.parse(post.json_metadata).image;
    const tags = _.union(JSON.parse(post.json_metadata).tags, [post.category]);
    const video = JSON.parse(post.json_metadata).video;

    let followText = '';

    if (postState.userFollowed && !pendingFollow) {
      followText = 'Unfollow';
    } else if (postState.userFollowed && pendingFollow) {
      followText = 'Unfollowing';
    } else if (!postState.userFollowed && !pendingFollow) {
      followText = 'Follow';
    } else if (!postState.userFollowed && pendingFollow) {
      followText = 'Following';
    }

    return (
      <div className="StoryFull">
        <h1 className="StoryFull__title">
          {post.title}
        </h1>
        <h3 className="StoryFull__comments_title">
          <a href="#comments">
            <FormattedMessage
              id="comments_count"
              values={{ count: commentCount }}
              defaultMessage="{count} comments"
            />
          </a>
        </h3>
        <div className="StoryFull__header">
          <Link to={`/@${post.author}`}>
            <Avatar username={post.author} size={60} />
          </Link>
          <div className="StoryFull__header__text">
            <Link to={`/@${post.author}`}>
              {post.author}
              <Tooltip title={intl.formatMessage({ id: 'reputation_score', defaultMessage: 'Reputation score' })}>
                <Tag>
                  {formatter.reputation(post.author_reputation)}
                </Tag>
              </Tooltip>
            </Link>
            <Tooltip
              title={
                <span>
                  <FormattedDate value={`${post.created}Z`} />{' '}
                  <FormattedTime value={`${post.created}Z`} />
                </span>
              }
            >
              <span className="StoryFull__header__text__date">
                <FormattedRelative value={`${post.created}Z`} />
              </span>
            </Tooltip>
          </div>
          <Popover
            placement="bottomRight"
            trigger="click"
            content={
              <PopoverMenu onSelect={this.handleClick} bold={false}>
                <PopoverMenuItem key="follow" disabled={pendingFollow}>
                  {pendingFollow ? <Icon type="loading" /> : <i className="iconfont icon-people" />}
                  {`${followText} ${post.author}`}
                </PopoverMenuItem>
                <PopoverMenuItem key="save">
                  <i className="iconfont icon-collection" />
                  {' '}
                  <FormattedMessage
                    id={postState.isSaved ? 'unsave_post' : 'save_post'}
                    defaultMessage={postState.isSaved ? 'Unsave post' : 'Save post'}
                  />
                </PopoverMenuItem>
                <PopoverMenuItem key="report">
                  <i className="iconfont icon-flag" />
                  {' '}
                  <FormattedMessage id="report_post" defaultMessage="Report post" />
                </PopoverMenuItem>
              </PopoverMenu>
            }
          >
            <i className="iconfont icon-more StoryFull__header__more" />
          </Popover>
        </div>
        <div
          role="presentation"
          ref={(div) => {
            this.contentDiv = div;
          }}
          onClick={this.handleContentClick}
        >
          {_.has(video, 'content.videohash') && _.has(video, 'info.snaphash') &&
            <video
              controls
              src={`https://ipfs.io/ipfs/${video.content.videohash}`}
              poster={`https://ipfs.io/ipfs/${video.info.snaphash}`}
            >
              <track kind="captions" />
            </video>
          }
          <Body full body={post.body} json_metadata={post.json_metadata} />
        </div>
        {open &&
          <Lightbox
            mainSrc={images[index]}
            nextSrc={images[(index + 1) % images.length]}
            prevSrc={images[(index + (images.length - 1)) % images.length]}
            onCloseRequest={() => {
              this.setState({
                lightbox: {
                  ...this.state.lightbox,
                  open: false,
                },
              });
            }}
            onMovePrevRequest={() =>
              this.setState({
                lightbox: {
                  ...this.state.lightbox,
                  index: (index + (images.length - 1)) % images.length,
                },
              })}
            onMoveNextRequest={() =>
              this.setState({
                lightbox: {
                  ...this.state.lightbox,
                  index: (index + (images.length + 1)) % images.length,
                },
              })}
          />}
        <div className="StoryFull__topics">
          {tags && tags.map(tag => <Topic key={tag} name={tag} />)}
        </div>
        <StoryFooter
          post={post}
          postState={postState}
          pendingLike={pendingLike}
          onLikeClick={onLikeClick}
          onShareClick={onShareClick}
        />
      </div>
    );
  }
}

export default StoryFull;