import { CourseLevel, CourseStatus, CourseVisibility } from "@/generated/prisma";
import { Calendar, ExternalLink, GitBranch, Share2, Star, Users ,Lock,Play,Globe} from "lucide-react";

const CourseCard = ({
  course,
 
}) => {

  const getStatusColor = (status) => {
    switch (status) {
      case CourseStatus.PUBLISHED:
        return "bg-green-100 text-green-800";
      case CourseStatus.DRAFT:
        return "bg-yellow-100 text-yellow-800";
      case CourseStatus.ARCHIVED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return "bg-blue-100 text-blue-800";
      case CourseLevel.INTERMEDIATE:
        return "bg-orange-100 text-orange-800";
      case CourseLevel.ADVANCED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {!course.isOriginal && (
                <GitBranch className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {course.description}
            </p>
          </div>
        </div>

        {/* Status and Level */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}
          >
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}
          >
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {course.visibility === CourseVisibility.PUBLIC ? (
              <>
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{course.videoCount} videos</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {course.totalEnrollments} enrolled
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{course.forkCount} forks</span>
          </div>
          {course.averageRating && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-600">{course.averageRating}/5</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {course.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {course.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{course.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Updated {formatDate(course.updatedAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            {course.status === CourseStatus.PUBLISHED && (
              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="View Course"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseCard;